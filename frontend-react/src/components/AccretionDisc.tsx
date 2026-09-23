import * as React from "react"
import { useEffect, useRef } from "react"

const TAU = Math.PI * 2
const DPR_CAP = 2

const ROUT = 100

const FOV_DEG = 34
const FOCAL = 1 / Math.tan((FOV_DEG * Math.PI) / 180 / 2)

const RIN_OF_CORE = 1.32
const RIN_FLOOR = 6

const THICKNESS = 2.4

const WIND = 3.40

const ARM_SHARPNESS = 2.6

const ARM_PULL = 0.45
const ARM_SPIN = 0.06
const JET_FLOW = 0.09
const JET_HELIX = 0.0055
const JET_SHARE = 0.32
const FOCUS_MULT = 1.75

const HALO = 1.7
const ORBIT_REF = 0.449

const DOT_REF = 0.16
const BLUR_REF = 0.64

const COUNT_BASE = 16000
const COUNT_PER = 2400

const TIME_WRAP = 1e5

const PARTICLE_VERT = `
precision highp float;

attribute vec4 aSeed;
attribute float aKind;

uniform float uTime;
uniform float uTilt;
uniform float uDist;
uniform float uAspect;
uniform float uHalfH;
uniform float uDotSize;
uniform float uBlur;
uniform float uScatter;
uniform float uCore;
uniform float uArms;
uniform float uJetAmount;
uniform float uJetLen;
uniform float uJetSpread;

varying float vAlpha;
varying float vRamp;

const float FOCAL = ${FOCAL.toFixed(6)};
const float ROUT = ${ROUT.toFixed(1)};
const float WIND = ${WIND.toFixed(3)};
const float THICKNESS = ${THICKNESS.toFixed(2)};

const float ORBIT = ${ORBIT_REF.toFixed(4)};

void kill() {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vAlpha = 0.0;
    vRamp = 0.0;
}

void main() {
    float rIn = max(uCore * ${RIN_OF_CORE.toFixed(2)}, ${RIN_FLOOR.toFixed(1)});
    vec3 p;
    float bright;
    float ramp;

    if (aKind == 0.0) {
        float r = sqrt(mix(rIn * rIn, ROUT * ROUT, aSeed.x));
        float f = clamp((r - rIn) / max(ROUT - rIn, 1e-3), 0.0, 1.0);

        float th = aSeed.y + ORBIT * pow(rIn / r, 1.5) * uTime;

        float armAngle = uArms * (th - WIND * log(r / rIn))
                       - ${ARM_SPIN.toFixed(3)} * uTime * min(uArms, 1.0);

        th -= ${ARM_PULL.toFixed(2)} * sin(armAngle) / max(uArms, 1.0);
        float arm = pow(0.5 + 0.5 * cos(armAngle), ${ARM_SHARPNESS.toFixed(1)});

        float flare = 0.30 + 0.70 * pow(f, 1.2);
        float y = aSeed.z * THICKNESS * uScatter * flare;
        p = vec3(r * cos(th), y, r * sin(th));

        float radial = smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.45, 1.0, f));
        radial *= 1.0 + 1.4 * exp(-pow((f - 0.32) / 0.20, 2.0));

        float farSide = 0.5 - 0.5 * (p.z / max(r, 1e-3));

        bright = radial * (0.34 + 0.75 * arm) * mix(0.62, 1.0, farSide) * 1.45;
        ramp = clamp((1.0 - f) * 0.55 + arm * 0.55, 0.0, 1.0);
    } else {
        if (aSeed.w > uJetAmount) { kill(); return; }

        float u = fract(aSeed.x + ${JET_FLOW.toFixed(3)} * uTime);
        float climb = pow(u, 1.35) * uJetLen;
        float cone = tan(uJetSpread) * climb * (0.30 + 0.70 * u) + uCore * 0.35;
        float rr = aSeed.z * cone;
        float az = aSeed.y + climb * ${JET_HELIX.toFixed(4)};
        p = vec3(rr * cos(az), aKind * climb, rr * sin(az));

        bright = mix(1.0, 0.20, smoothstep(0.0, 1.0, u)) * (0.28 + 0.72 * (1.0 - aSeed.z)) * 1.75;
        ramp = 0.30 + 0.40 * (1.0 - u);
    }

    float c = cos(uTilt);
    float s = sin(uTilt);
    vec3 camPos = vec3(0.0, uDist * s, uDist * c);
    vec3 rel = p - camPos;

    vec3 q = vec3(rel.x, c * rel.y - s * rel.z, s * rel.y + c * rel.z);
    float depth = -q.z;
    if (depth < 1.0) { kill(); return; }

    float len = length(q);
    vec3 dir = q / max(len, 1e-4);
    float tca = -uDist * dir.z;
    float perp2 = uDist * uDist - tca * tca;
    float core2 = uCore * uCore;
    if (perp2 < core2) {
        float tEnter = tca - sqrt(core2 - perp2);
        if (tEnter > 0.0 && len > tEnter) { kill(); return; }
    }

    gl_Position = vec4(q.x * FOCAL / (depth * uAspect), q.y * FOCAL / depth, 0.0, 1.0);

    float ppw = FOCAL * uHalfH / depth;
    float focusD = uDist * ${FOCUS_MULT.toFixed(2)};
    float coc = uBlur * max(0.0, focusD - depth) / focusD;
    float px = (uDotSize + coc) * ppw * ${HALO.toFixed(2)};

    vAlpha = bright * pow(uDotSize / max(uDotSize + coc, 1e-5), 1.6);

    float optical = px / ${HALO.toFixed(2)};
    if (optical < 1.0) vAlpha *= optical * optical;
    vRamp = ramp;
    gl_PointSize = clamp(px, 1.0, 96.0);
}
`

const PARTICLE_FRAG = `
precision highp float;

uniform vec3 uBase;
uniform vec3 uAccent;

varying float vAlpha;
varying float vRamp;

void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r2 = dot(d, d) * 4.0;
    if (r2 > 1.0) discard;

    float core = max(0.0, exp(-r2 * 9.25) - 0.0000961);
    float skirt = max(0.0, exp(-r2 * 1.80) - 0.165299);
    float g = core + 0.30 * skirt;
    float e = g * vAlpha;
    vec3 col = mix(uBase, uAccent, vRamp);

    gl_FragColor = vec4(col * e, e);
}
`

const CORE_VERT = `
precision highp float;

attribute vec2 aQuad;

uniform float uDist;
uniform float uCore;
uniform float uAspect;
uniform float uHalfH;

varying vec2 vUV;
varying float vPxR;

const float FOCAL = ${FOCAL.toFixed(6)};

void main() {
    float tanR = uCore / sqrt(max(uDist * uDist - uCore * uCore, 1.0));
    float ndcR = tanR * FOCAL;
    vUV = aQuad;
    vPxR = ndcR * uHalfH;
    gl_Position = vec4(aQuad.x * ndcR / uAspect, aQuad.y * ndcR, 0.0, 1.0);
}
`

const CORE_FRAG = `
precision highp float;

uniform vec3 uBase;
uniform vec3 uAccent;
uniform float uTilt;

varying vec2 vUV;
varying float vPxR;

void main() {
    float rr = length(vUV);

    float aa = 1.0 / max(vPxR, 1.0);
    float m = 1.0 - smoothstep(1.0 - aa, 1.0, rr);
    if (m <= 0.0) discard;

    float st = sin(uTilt) * 0.55;
    float dTop = vUV.y - st;
    float dBot = vUV.y + st;
    float ring = 0.40 * exp(-dTop * dTop * 9.0) + 1.0 * exp(-dBot * dBot * 9.0);

    float rim = pow(smoothstep(0.78, 1.0, rr), 1.6);
    float lit = rim * (0.05 + 0.95 * ring * (0.30 + 0.70 * abs(vUV.x)));

    vec3 col = uBase * 0.012 + uAccent * lit * 0.42;
    gl_FragColor = vec4(col * m, m);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("AccretionDisc shader:", gl.getShaderInfoLog(sh))
    }
    return sh
}

function link(gl: WebGLRenderingContext, vs: string, fs: string) {
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs))
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.warn("AccretionDisc link:", gl.getProgramInfoLog(p))
    }
    return p
}

function parseColor(input: string | undefined): [number, number, number] {
    if (!input) return [1, 0.37, 0] // Default cosmic orange
    let s = String(input).trim()

    const rgb = s.match(/rgba?\(([^)]+)\)/i)
    if (rgb) {
        const p = rgb[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat)
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }

    let hx = s.replace("#", "")
    if (hx.length === 3 || hx.length === 4) {
        hx = hx.split("").map((ch) => ch + ch).join("")
    }
    hx = hx.padEnd(6, "0")
    const v = (i: number) => {
        const n = parseInt(hx.slice(i, i + 2), 16)
        return Number.isFinite(n) ? n / 255 : 0
    }
    return [v(0), v(2), v(4)]
}

function mulberry32(a: number) {
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function gauss(rnd: () => number) {
    const u1 = Math.max(1e-9, rnd())
    const u2 = rnd()
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2)
    return Math.max(-3, Math.min(3, g))
}

function buildCloud(count: number) {
    const seed = new Float32Array(count * 4)
    const kind = new Float32Array(count)
    const rnd = mulberry32(0x9e3779b9)
    for (let i = 0; i < count; i++) {
        const o = i * 4
        if (rnd() >= JET_SHARE) {
            seed[o] = rnd()
            seed[o + 1] = rnd() * TAU
            seed[o + 2] = gauss(rnd)
            seed[o + 3] = rnd()
            kind[i] = 0
        } else {
            seed[o] = rnd()
            seed[o + 1] = rnd() * TAU
            seed[o + 2] = Math.sqrt(rnd())
            seed[o + 3] = rnd()
            kind[i] = rnd() < 0.5 ? 1 : -1
        }
    }
    return { seed, kind }
}

export interface AccretionDiscProps {
    background?: string
    baseColor?: string
    accentColor?: string
    density?: number
    dotSize?: number
    speed?: number
    distance?: number
    arms?: number
    tilt?: number
    core?: number
    interactive?: boolean
    className?: string
    style?: React.CSSProperties
}

export const AccretionDisc: React.FC<AccretionDiscProps> = ({
    background = "transparent",
    baseColor = "#FF5F00",
    accentColor = "#ffd814",
    density = 80,
    dotSize = 190,
    speed = 85,
    distance = 220,
    arms = 6,
    tilt = 42,
    core = 6,
    interactive = true,
    className = "",
    style = {},
}) => {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseTiltRef = useRef<number>(0)

    const live = useRef({
        base: parseColor(baseColor),
        accent: parseColor(accentColor),
        count: Math.round(COUNT_BASE + density * COUNT_PER),
        dotSize: (DOT_REF * dotSize) / 100,
        speed: speed,
        distance: distance,
        scatter: 44 / 100,
        blur: (BLUR_REF * 0) / 100,
        tilt: (tilt * Math.PI) / 180,
        core: (core / 100) * ROUT,
        arms: arms,
        jetAmount: 23 / 100,
        jetLen: (300 / 100) * ROUT,
        jetSpread: (34 * Math.PI) / 180,
    })

    // Update live ref when props change
    useEffect(() => {
        live.current.base = parseColor(baseColor)
        live.current.accent = parseColor(accentColor)
        live.current.count = Math.round(COUNT_BASE + density * COUNT_PER)
        live.current.dotSize = (DOT_REF * dotSize) / 100
        live.current.speed = speed
        live.current.distance = distance
        live.current.arms = arms
        live.current.tilt = (tilt * Math.PI) / 180
        live.current.core = (core / 100) * ROUT
    }, [baseColor, accentColor, density, dotSize, speed, distance, arms, tilt, core])

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
        })
        if (!gl) return

        const particleProg = link(gl, PARTICLE_VERT, PARTICLE_FRAG)
        const coreProg = link(gl, CORE_VERT, CORE_FRAG)

        const pu = {
            uTime: gl.getUniformLocation(particleProg, "uTime"),
            uTilt: gl.getUniformLocation(particleProg, "uTilt"),
            uDist: gl.getUniformLocation(particleProg, "uDist"),
            uAspect: gl.getUniformLocation(particleProg, "uAspect"),
            uHalfH: gl.getUniformLocation(particleProg, "uHalfH"),
            uDotSize: gl.getUniformLocation(particleProg, "uDotSize"),
            uBlur: gl.getUniformLocation(particleProg, "uBlur"),
            uScatter: gl.getUniformLocation(particleProg, "uScatter"),
            uCore: gl.getUniformLocation(particleProg, "uCore"),
            uArms: gl.getUniformLocation(particleProg, "uArms"),
            uJetAmount: gl.getUniformLocation(particleProg, "uJetAmount"),
            uJetLen: gl.getUniformLocation(particleProg, "uJetLen"),
            uJetSpread: gl.getUniformLocation(particleProg, "uJetSpread"),
            uBase: gl.getUniformLocation(particleProg, "uBase"),
            uAccent: gl.getUniformLocation(particleProg, "uAccent"),
        }
        const cu = {
            uDist: gl.getUniformLocation(coreProg, "uDist"),
            uCore: gl.getUniformLocation(coreProg, "uCore"),
            uAspect: gl.getUniformLocation(coreProg, "uAspect"),
            uHalfH: gl.getUniformLocation(coreProg, "uHalfH"),
            uBase: gl.getUniformLocation(coreProg, "uBase"),
            uAccent: gl.getUniformLocation(coreProg, "uAccent"),
            uTilt: gl.getUniformLocation(coreProg, "uTilt"),
        }

        const aSeed = gl.getAttribLocation(particleProg, "aSeed")
        const aKind = gl.getAttribLocation(particleProg, "aKind")
        const aQuad = gl.getAttribLocation(coreProg, "aQuad")

        const seedBuf = gl.createBuffer()!
        const kindBuf = gl.createBuffer()!
        const quadBuf = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        )

        let built = 0
        const rebuild = (count: number) => {
            const { seed, kind } = buildCloud(count)
            gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf)
            gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW)
            gl.bindBuffer(gl.ARRAY_BUFFER, kindBuf)
            gl.bufferData(gl.ARRAY_BUFFER, kind, gl.STATIC_DRAW)
            built = count
        }

        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)

        let bw = 1
        let bh = 1
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
            const cw = host.clientWidth || 300
            const ch = host.clientHeight || 200
            const w = Math.max(1, Math.round(cw * dpr))
            const h = Math.max(1, Math.round(ch * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
            }
            bw = w
            bh = h
            gl.viewport(0, 0, w, h)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(host)

        // Subtle mouse parallax
        const onMouseMove = (e: MouseEvent) => {
            if (!interactive) return
            const rect = host.getBoundingClientRect()
            const my = (e.clientY - rect.top) / rect.height - 0.5
            mouseTiltRef.current = my * 0.15
        }
        if (interactive) {
            host.addEventListener("mousemove", onMouseMove)
        }

        let raf = 0
        let last = 0
        let t = 0

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)

            const dt = last === 0 ? 0 : Math.min(0.05, Math.max(0, (now - last) / 1000))
            last = now

            const s = live.current
            const speedScale = s.speed / 50
            t = (t + dt * speedScale) % TIME_WRAP
            if (built !== s.count) rebuild(s.count)

            const aspect = bw / Math.max(bh, 1)
            const halfH = bh * 0.5
            const currentTilt = s.tilt + mouseTiltRef.current

            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            gl.useProgram(coreProg)
            gl.uniform1f(cu.uDist, s.distance)
            gl.uniform1f(cu.uCore, s.core)
            gl.uniform1f(cu.uAspect, aspect)
            gl.uniform1f(cu.uHalfH, halfH)
            gl.uniform1f(cu.uTilt, currentTilt)
            gl.uniform3fv(cu.uBase, s.base)
            gl.uniform3fv(cu.uAccent, s.accent)
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
            gl.enableVertexAttribArray(aQuad)
            gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            gl.disableVertexAttribArray(aQuad)

            gl.blendFunc(gl.ONE, gl.ONE)
            gl.useProgram(particleProg)
            gl.uniform1f(pu.uTime, t)
            gl.uniform1f(pu.uTilt, currentTilt)
            gl.uniform1f(pu.uDist, s.distance)
            gl.uniform1f(pu.uAspect, aspect)
            gl.uniform1f(pu.uHalfH, halfH)
            gl.uniform1f(pu.uDotSize, s.dotSize)
            gl.uniform1f(pu.uBlur, s.blur)
            gl.uniform1f(pu.uScatter, s.scatter)
            gl.uniform1f(pu.uCore, s.core)
            gl.uniform1f(pu.uArms, s.arms)
            gl.uniform1f(pu.uJetAmount, s.jetAmount)
            gl.uniform1f(pu.uJetLen, s.jetLen)
            gl.uniform1f(pu.uJetSpread, s.jetSpread)
            gl.uniform3fv(pu.uBase, s.base)
            gl.uniform3fv(pu.uAccent, s.accent)
            gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf)
            gl.enableVertexAttribArray(aSeed)
            gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, kindBuf)
            gl.enableVertexAttribArray(aKind)
            gl.vertexAttribPointer(aKind, 1, gl.FLOAT, false, 0, 0)
            gl.drawArrays(gl.POINTS, 0, built)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            if (interactive) {
                host.removeEventListener("mousemove", onMouseMove)
            }
            gl.deleteProgram(particleProg)
            gl.deleteProgram(coreProg)
            gl.deleteBuffer(seedBuf)
            gl.deleteBuffer(kindBuf)
            gl.deleteBuffer(quadBuf)
        }
    }, [interactive])

    return (
        <div
            ref={hostRef}
            className={`relative overflow-hidden w-full h-full ${className}`}
            style={{
                background,
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block pointer-events-none"
            />
        </div>
    )
}

export default AccretionDisc
