from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
import httpx
import logging
from shared.config_base import settings

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("APIGateway")

app = FastAPI(
    title="Distributed Commerce API Gateway",
    description="FastAPI Gateway routing requests to backend microservices.",
    version="1.0.0"
)

# Service Mapping: Path Prefix -> Service URL
# In production/Docker, these would be the container names
SERVICES = {
    "/api/v1/identity": "http://localhost:8001",
    "/api/v1/catalog": "http://localhost:8002",
    "/api/v1/inventory": "http://localhost:8003",
    "/api/v1/order": "http://localhost:8004",
}

async def forward_request(target_url: str, request: Request):
    """
    Forwards the incoming request to the target microservice.
    """
    # Extract path and query params
    path = request.url.path
    query_params = request.url.query
    url = f"{target_url}{path}"
    if query_params:
        url += f"?{query_params}"

    # Extract body
    body = await request.body()
    headers = dict(request.headers)
    # Remove 'host' header to avoid conflicts with the target service
    headers.pop("host", None)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                timeout=10.0
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except httpx.RequestError as exc:
            logger.error(f"❌ Gateway Error: Could not connect to service at {target_url}: {exc}")
            return JSONResponse(
                status_code=503,
                content={"error": "Service Unavailable", "details": str(exc)}
            )

@app.get("/")
async def root():
    return {"message": "Welcome to the Distributed Commerce API Gateway. Please use /api/v1 endpoints."}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway_route(request: Request, path: str):
    """
    Dynamic router that forwards requests to microservices based on the URL prefix.
    """
    full_path = f"/{path}"

    for prefix, target_url in SERVICES.items():
        if full_path.startswith(prefix):
            logger.info(f"➡️ Routing {request.method} {full_path} to {target_url}")
            return await forward_request(target_url, request)

    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "details": f"No service mapped to prefix {full_path}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
