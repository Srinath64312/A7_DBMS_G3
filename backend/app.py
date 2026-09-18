"""
Main Application Entrypoint & REST API Server with Interactive Swagger UI / OpenAPI 3.0
Course: 25CS1302E - DBS-DBD (Department of CSE, KL University)
Distributed Digital Commerce & Inventory Intelligence Platform
"""
import os
import sys
import logging
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from flasgger import Swagger

# Add root folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import config
from backend.db import postgres_db, mongo_db, cache_manager
from backend.services import auth_service, catalog_service, inventory_service, order_service, intelligence_service, address_service, payment_service, shipping_service, review_service, coupon_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("DistributedCommerceApp")

# Static frontend folder
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
app = Flask(__name__, static_folder=frontend_dir, static_url_path="")
CORS(app)
swagger = Swagger(app)

# ==============================================================================
# Interactive Swagger UI (OpenAPI 3.0) - /docs & /swagger
# ==============================================================================
SWAGGER_UI_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger API Docs - Distributed Commerce Platform</title>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #0f172a; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui { color: #e2e8f0; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .swagger-ui .info .title { color: #818cf8; }
        .swagger-ui .info p, .swagger-ui .info li { color: #94a3b8; }
        .swagger-ui .scheme-container { background: #1e293b; box-shadow: none; border-radius: 8px; }
        .swagger-ui select { background: #0f172a; color: #fff; }
        .swagger-ui .opblock { border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "/api/openapi.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "BaseLayout",
                persistAuthorization: true
            });
            window.ui = ui;
        };
    </script>
</body>
</html>
"""

@app.route("/docs")
@app.route("/swagger")
def serve_swagger_docs():
    return render_template_string(SWAGGER_UI_HTML)

@app.route("/api/openapi.json")
def get_openapi_spec():
    spec = {
        "openapi": "3.0.3",
        "info": {
            "title": "Distributed Digital Commerce & Inventory Intelligence API",
            "version": "1.0.0",
            "description": "Interactive REST & AI APIs for Course 25CS1302E (DBS-DBD), KL University Aziz Nagar.\nFeatures Hybrid PostgreSQL (klhdb) + MongoDB persistence, Redis TTL locks, AI vector similarity search, and ACID checkout transactions."
        },
        "servers": [{"url": "http://127.0.0.1:5000", "description": "Local Development Server"}],
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "Enter your JWT token obtained from POST /api/auth/login"
                }
            }
        },
        "paths": {
            "/api/auth/login": {
                "post": {
                    "tags": ["01. Authentication & RBAC"],
                    "summary": "Authenticate user & issue JWT token (TC01)",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string", "example": "abhinay@klh.edu.in"},
                                        "password": {"type": "string", "example": "Customer@123"}
                                    },
                                    "required": ["email", "password"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "JWT issued successfully"}, "401": {"description": "Invalid credentials"}}
                }
            },
            "/api/auth/register": {
                "post": {
                    "tags": ["01. Authentication & RBAC"],
                    "summary": "Register a new user account",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string", "example": "John Doe"},
                                        "email": {"type": "string", "example": "john@klh.edu.in"},
                                        "password": {"type": "string", "example": "Pass@123"},
                                        "role": {"type": "string", "enum": ["CUSTOMER", "WAREHOUSE_MANAGER", "ADMIN"], "example": "CUSTOMER"}
                                    },
                                    "required": ["name", "email", "password"]
                                }
                            }
                        }
                    },
                    "responses": {"201": {"description": "User registered"}}
                }
            },
            "/api/auth/me": {
                "get": {
                    "tags": ["01. Authentication & RBAC"],
                    "summary": "Get authenticated user profile (JWT protected)",
                    "security": [{"BearerAuth": []}],
                    "responses": {"200": {"description": "Current profile claims"}, "401": {"description": "Unauthorized"}}
                }
            },
            "/api/products": {
                "get": {
                    "tags": ["02. Catalog & Hybrid Persistence"],
                    "summary": "List catalog products (PostgreSQL core + MongoDB specs) (TC03)",
                    "parameters": [
                        {"name": "category_id", "in": "query", "schema": {"type": "string"}},
                        {"name": "search", "in": "query", "schema": {"type": "string"}},
                        {"name": "tag", "in": "query", "schema": {"type": "string"}}
                    ],
                    "responses": {"200": {"description": "Product list"}}
                },
                "post": {
                    "tags": ["02. Catalog & Hybrid Persistence"],
                    "summary": "Create new product (Admin RBAC) (TC02)",
                    "security": [{"BearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string", "example": "AI Quantum Accelerator"},
                                        "sku": {"type": "string", "example": "AI-Q-100"},
                                        "price": {"type": "number", "example": 899.99},
                                        "category_id": {"type": "string", "example": "cat_comp_01"},
                                        "description": {"type": "string", "example": "Dedicated tensor accelerator"},
                                        "attributes": {"type": "object", "example": {"tops": 128, "vram_gb": 16}},
                                        "tags": {"type": "array", "items": {"type": "string"}, "example": ["ai", "hardware"]}
                                    },
                                    "required": ["name", "sku", "price"]
                                }
                            }
                        }
                    },
                    "responses": {"201": {"description": "Product created"}, "403": {"description": "Admin access required"}}
                }
            },
            "/api/products/{product_id}": {
                "get": {
                    "tags": ["02. Catalog & Hybrid Persistence"],
                    "summary": "Get single product with Cache-Aside pattern (TC03)",
                    "parameters": [{"name": "product_id", "in": "path", "required": True, "schema": {"type": "string", "example": "prod_lap_01"}}],
                    "responses": {"200": {"description": "Product details"}, "404": {"description": "Not found"}}
                }
            },
            "/api/products/{product_id}/recommendations": {
                "get": {
                    "tags": ["02. Catalog & Hybrid Persistence", "05. AI Intelligence & Analytics"],
                    "summary": "AI Vector Similarity Recommendations (pgvector cosine search)",
                    "parameters": [{"name": "product_id", "in": "path", "required": True, "schema": {"type": "string", "example": "prod_lap_01"}}],
                    "responses": {"200": {"description": "Top semantically similar products"}}
                }
            },
            "/api/categories": {
                "get": {
                    "tags": ["02. Catalog & Hybrid Persistence"],
                    "summary": "List all categories",
                    "responses": {"200": {"description": "Categories list"}}
                }
            },
            "/api/warehouses": {
                "get": {
                    "tags": ["03. Multi-Warehouse Inventory"],
                    "summary": "List all regional distribution hubs",
                    "responses": {"200": {"description": "Warehouse locations"}}
                }
            },
            "/api/inventory": {
                "get": {
                    "tags": ["03. Multi-Warehouse Inventory"],
                    "summary": "List real-time stock across warehouses",
                    "parameters": [{"name": "warehouse_id", "in": "query", "schema": {"type": "string"}}],
                    "responses": {"200": {"description": "Inventory list"}}
                },
                "patch": {
                    "tags": ["03. Multi-Warehouse Inventory"],
                    "summary": "Restock / Adjust inventory (Manager/Admin RBAC) (TC04)",
                    "security": [{"BearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "product_id": {"type": "string", "example": "prod_audio_03"},
                                        "warehouse_id": {"type": "string", "example": "wh_hyd_01"},
                                        "delta": {"type": "integer", "example": 20},
                                        "note": {"type": "string", "example": "Restock shipment batch #102"}
                                    },
                                    "required": ["product_id", "warehouse_id", "delta"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Stock updated and audit logged"}}
                }
            },
            "/api/inventory/{product_id}/reserve": {
                "put": {
                    "tags": ["03. Multi-Warehouse Inventory"],
                    "summary": "Reserve stock for checkout with 10-minute TTL lock",
                    "security": [{"BearerAuth": []}],
                    "parameters": [{"name": "product_id", "in": "path", "required": True, "schema": {"type": "string", "example": "prod_lap_01"}}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "warehouse_id": {"type": "string", "example": "wh_hyd_01"},
                                        "quantity": {"type": "integer", "example": 1}
                                    },
                                    "required": ["warehouse_id"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Stock reserved with TTL lock"}}
                }
            },
            "/api/inventory/audit": {
                "get": {
                    "tags": ["03. Multi-Warehouse Inventory"],
                    "summary": "Get immutable inventory transaction audit trail",
                    "responses": {"200": {"description": "Audit log entries"}}
                }
            },
            "/api/orders": {
                "post": {
                    "tags": ["04. Orders & ACID Transactions"],
                    "summary": "Execute ACID transactional checkout (TC06, TC07)",
                    "security": [{"BearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "items": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "product_id": {"type": "string", "example": "prod_lap_01"},
                                                    "warehouse_id": {"type": "string", "example": "wh_hyd_01"},
                                                    "quantity": {"type": "integer", "example": 1}
                                                }
                                            }
                                        },
                                        "shipping_address": {"type": "string", "example": "CSE Block, KL University"}
                                    },
                                    "required": ["items"]
                                }
                            }
                        }
                    },
                    "responses": {"201": {"description": "Order committed atomically"}, "400": {"description": "Insufficient stock (ACID Rollback)"}}
                },
                "get": {
                    "tags": ["04. Orders & ACID Transactions"],
                    "summary": "List orders for current user or all orders (if admin)",
                    "security": [{"BearerAuth": []}],
                    "responses": {"200": {"description": "Orders list"}}
                }
            },
            "/api/cache/stats": {
                "get": {
                    "tags": ["05. Cache & Distributed Locks"],
                    "summary": "Get Cache-Aside hit/miss metrics and active TTL reservation locks",
                    "responses": {"200": {"description": "Cache statistics"}}
                }
            },
            "/api/cache/clear": {
                "post": {
                    "tags": ["05. Cache & Distributed Locks"],
                    "summary": "Invalidate / Flush Cache to test cache misses vs hits",
                    "responses": {"200": {"description": "Cache invalidated"}}
                }
            },
            "/api/intelligence/forecast": {
                "get": {
                    "tags": ["06. AI Intelligence & Analytics"],
                    "summary": "AI Demand Velocity & Automated Reorder Point Forecast",
                    "responses": {"200": {"description": "Inventory intelligence forecast"}}
                }
            },
            "/api/status/databases": {
                "get": {
                    "tags": ["07. System Health & Diagnostics"],
                    "summary": "Get live connection status for PostgreSQL (klhdb), MongoDB, and Cache",
                    "responses": {"200": {"description": "Health status"}}
                }
            },
            "/api/tests/run": {
                "post": {
                    "tags": ["07. System Health & Diagnostics"],
                    "summary": "Run full automated test suite (TC01 to TC10 from Slide 7)",
                    "responses": {"200": {"description": "Test results summary"}}
                }
            },
            "/api/addresses": {
                "get": {
                    "tags": ["08. User Profile & Addresses"],
                    "summary": "List user's saved addresses",
                    "security": [{"BearerAuth": []}],
                    "responses": {"200": {"description": "Addresses list"}}
                },
                "post": {
                    "tags": ["08. User Profile & Addresses"],
                    "summary": "Add a new shipping address",
                    "security": [{"BearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "address_line1": {"type": "string", "example": "123 Main St"},
                                        "city": {"type": "string", "example": "Hyderabad"},
                                        "state": {"type": "string", "example": "Telangana"},
                                        "zip": {"type": "string", "example": "500001"},
                                        "country": {"type": "string", "example": "India"},
                                        "is_default": {"type": "boolean", "example": true}
                                    },
                                    "required": ["address_line1", "city", "state", "zip"]
                                }
                            }
                        }
                    },
                    "responses": {"201": {"description": "Address added"}}
                }
            },
            "/api/payments/process": {
                "post": {
                    "tags": ["04. Orders & ACID Transactions"],
                    "summary": "Complete payment for an order",
                    "security": [{"BearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "payment_id": {"type": "string"},
                                        "method": {"type": "string", "enum": ["CREDIT_CARD", "DEBIT_CARD", "UPI", "PAYPAL", "CRYPTO"]},
                                        "transaction_id": {"type": "string", "example": "TXN_99887766"}
                                    },
                                    "required": ["payment_id", "method", "transaction_id"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Payment completed successfully"}}
                }
            },
            "/api/shipping/{order_id}": {
                "get": {
                    "tags": ["04. Orders & ACID Transactions"],
                    "summary": "Track order shipment",
                    "parameters": [{"name": "order_id", "in": "path", "required": True, "schema": {"type": "string"}}],
                    "responses": {"200": {"description": "Shipping status"}}
                }
            },
            "/api/reviews": {
                "post": {
                    "tags": ["02. Catalog & Hybrid Persistence"],
                    "summary": "Submit a product review",
                    "security": [{"BearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "product_id": {"type": "string"},
                                        "rating": {"type": "integer", "minimum": 1, "maximum": 5},
                                        "comment": {"type": "string"}
                                    },
                                    "required": ["product_id", "rating"]
                                }
                            }
                        }
                    },
                    "responses": {"201": {"description": "Review submitted"}}
                }
            },
            "/api/reviews/{product_id}": {
                "get": {
                    "tags": ["02. Catalog & Hybrid Persistence"],
                    "summary": "Get all reviews for a product",
                    "parameters": [{"name": "product_id", "in": "path", "required": True, "schema": {"type": "string"}}],
                    "responses": {"200": {"description": "Reviews list"}}
                }
            },
            "/api/coupons/validate": {
                "post": {
                    "tags": ["04. Orders & ACID Transactions"],
                    "summary": "Validate a discount coupon",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "code": {"type": "string", "example": "SAVE10"},
                                        "order_amount": {"type": "number", "example": 500.0}
                                    },
                                    "required": ["code", "order_amount"]
                                }
                            }
                        }
                    },
                    "responses": {"200": {"description": "Coupon validated"}, "400": {"description": "Invalid coupon"}}
                }
            }
        }
    }
    return jsonify(spec)

# ==============================================================================
# Static Frontend Routes
# ==============================================================================
@app.route("/")
def serve_index():
    return send_from_directory(frontend_dir, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(frontend_dir, path)

# ==============================================================================
# 01. Authentication & RBAC APIs (Slide 5)
# ==============================================================================
@app.route("/api/auth/register", methods=["POST"])
def register():
    """
    Register a new user account
    ---
    tags: [Authentication]
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: UserRegister
          required: [name, email, password]
          properties:
            name: {type: string, example: "John Doe"}
            email: {type: string, example: "john@klh.edu.in"}
            password: {type: string, example: "Pass@123"}
            role: {type: string, enum: [CUSTOMER, WAREHOUSE_MANAGER, ADMIN], default: CUSTOMER}
    responses:
      201:
        description: User registered successfully
      400:
        description: Invalid input or user already exists
    """
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "CUSTOMER")

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields: name, email, password"}), 400

    try:
        user = auth_service.register_user(name, email, password, role)
        return jsonify(user), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    Authenticate user & issue JWT token
    ---
    tags: [Authentication]
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: UserLogin
          required: [email, password]
          properties:
            email: {type: string, example: "abhinay@klh.edu.in"}
            password: {type: string, example: "Customer@123"}
    responses:
      200:
        description: Login successful, JWT returned
      401:
        description: Invalid credentials
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = auth_service.login_user(email, password)
        return jsonify(user), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route("/api/auth/me", methods=["GET"])
@auth_service.auth_required()
def get_current_user_profile():
    return jsonify(request.current_user), 200

# ==============================================================================
# 02. Catalog & Hybrid Persistence APIs (Slide 4 & 5)
# ==============================================================================
@app.route("/api/categories", methods=["GET"])
def list_categories():
    return jsonify(catalog_service.get_categories()), 200

@app.route("/api/products", methods=["GET"])
def list_products():
    category_id = request.args.get("category_id")
    search = request.args.get("search")
    tag = request.args.get("tag")
    products = catalog_service.get_products(category_id=category_id, search=search, tag=tag)
    return jsonify(products), 200

@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id):
    prod = catalog_service.get_product_by_id(product_id)
    if not prod:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(prod), 200

@app.route("/api/products", methods=["POST"])
@auth_service.auth_required(roles=["ADMIN"])
def create_product():
    data = request.get_json(silent=True) or {}
    if not data or not data.get("name") or not data.get("sku") or "price" not in data:
        return jsonify({"error": "Missing required fields: name, sku, price"}), 400

    try:
        new_prod = catalog_service.create_product(
            name=data["name"],
            category_id=data.get("category_id"),
            sku=data["sku"],
            price=data["price"],
            attributes=data.get("attributes", {}),
            description=data.get("description", ""),
            supplier_id=data.get("supplier_id", ""),
            tags=data.get("tags", []),
            image_url=data.get("image_url", "")
        )
        return jsonify(new_prod), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/products/<product_id>/recommendations", methods=["GET"])
def get_recommendations(product_id):
    recs = intelligence_service.get_product_recommendations(product_id)
    return jsonify(recs), 200

# ==============================================================================
# 03. Multi-Warehouse Inventory APIs (Slide 5 & 6)
# ==============================================================================
@app.route("/api/warehouses", methods=["GET"])
def list_warehouses():
    return jsonify(inventory_service.get_warehouses()), 200

@app.route("/api/inventory", methods=["GET"])
def list_inventory():
    warehouse_id = request.args.get("warehouse_id")
    return jsonify(inventory_service.get_all_inventory(warehouse_id=warehouse_id)), 200

@app.route("/api/inventory/<product_id>", methods=["GET"])
def get_inventory_by_product(product_id):
    inv = inventory_service.get_product_inventory(product_id)
    return jsonify(inv), 200

@app.route("/api/inventory", methods=["PATCH"])
@auth_service.auth_required(roles=["ADMIN", "WAREHOUSE_MANAGER"])
def update_inventory():
    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")
    warehouse_id = data.get("warehouse_id")
    delta = data.get("delta")

    if not product_id or not warehouse_id or delta is None:
        return jsonify({"error": "Missing product_id, warehouse_id, or delta"}), 400

    try:
        res = inventory_service.update_inventory_stock(
            product_id=product_id,
            warehouse_id=warehouse_id,
            delta=int(delta),
            note=data.get("note", "Manual Restock/Adjustment"),
            performed_by=request.current_user.get("email", "Staff")
        )
        return jsonify(res), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/inventory/<product_id>/reserve", methods=["PUT"])
@auth_service.auth_required()
def reserve_stock(product_id):
    data = request.get_json(silent=True) or {}
    warehouse_id = data.get("warehouse_id")
    quantity = data.get("quantity", 1)

    if not warehouse_id:
        return jsonify({"error": "warehouse_id is required"}), 400

    try:
        res = inventory_service.reserve_product_stock(
            product_id=product_id,
            warehouse_id=warehouse_id,
            user_id=request.current_user["user_id"],
            quantity=int(quantity)
        )
        return jsonify(res), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

@app.route("/api/inventory/audit", methods=["GET"])
def get_audit_log():
    product_id = request.args.get("product_id")
    return jsonify(inventory_service.get_inventory_audit_log(product_id=product_id)), 200

# ==============================================================================
# 04. Orders & ACID Transaction APIs (Slide 5, 6, 7)
# ==============================================================================
@app.route("/api/orders", methods=["POST"])
@auth_service.auth_required()
def place_order():
    """
    Execute ACID transactional checkout (TC06, TC07)
    ---
    tags: [Orders]
    security:
      - BearerAuth: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: OrderPayload
          required: [items]
          properties:
            items:
              type: array
              items:
                type: object
                properties:
                  product_id: {type: string, example: "prod_lap_01"}
                  warehouse_id: {type: string, example: "wh_hyd_01"}
                  quantity: {type: integer, example: 1}
            shipping_address: {type: string, example: "CSE Block, KL University"}
            coupon_code: {type: string, example: "WELCOME10"}
    responses:
      201:
        description: Order committed atomically (Status: PENDING)
      400:
        description: Insufficient stock or invalid input (ACID Rollback)
    """
    data = request.get_json(silent=True) or {}
    items = data.get("items")
    shipping_address = data.get("shipping_address", "Campus Deliveries, KL University")

    if not items or not isinstance(items, list):
        return jsonify({"error": "Invalid order payload. 'items' array required."}), 400

    try:
        order = order_service.create_order_atomic(
            user_id=request.current_user["user_id"],
            items=items,
            shipping_address=shipping_address,
            coupon_code=data.get("coupon_code")
        )
        return jsonify(order), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"ACID Order Placement Failed (Rolled Back): {e}")
        return jsonify({"error": f"Transaction rolled back: {str(e)}"}), 500

@app.route("/api/orders/<order_id>", methods=["GET"])
@auth_service.auth_required()
def get_order(order_id):
    order = order_service.get_order_by_id(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order), 200

@app.route("/api/orders", methods=["GET"])
@auth_service.auth_required()
def list_orders():
    user = request.current_user
    if user.get("role") in ["ADMIN", "WAREHOUSE_MANAGER"]:
        return jsonify(order_service.get_all_orders()), 200
    else:
        return jsonify(order_service.get_user_orders(user["user_id"])), 200

# ==============================================================================
# 05. Cache & Distributed Lock APIs
# ==============================================================================
@app.route("/api/cache/stats", methods=["GET"])
def get_cache_statistics():
    return jsonify(cache_manager.get_cache_status()), 200

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache_endpoint():
    count = cache_manager.invalidate_cache()
    return jsonify({"message": f"Flushed {count} keys from cache.", "invalidated_count": count}), 200

# ==============================================================================
# 06. Intelligence & System Health APIs
# ==============================================================================
@app.route("/api/intelligence/forecast", methods=["GET"])
def get_intelligence_report():
    report = intelligence_service.calculate_inventory_intelligence()
    return jsonify(report), 200

@app.route("/api/status/databases", methods=["GET"])
def get_db_status():
    return jsonify({
        "relational_db": postgres_db.get_engine_status(),
        "document_db": mongo_db.get_mongo_status(),
        "cache_layer": cache_manager.get_cache_status()
    }), 200

# ==============================================================================
# 08. User Profile & Address APIs
# ==============================================================================
@app.route("/api/addresses", methods=["GET"])
@auth_service.auth_required()
def get_addresses():
    return jsonify(address_service.get_user_addresses(request.current_user["user_id"])), 200

@app.route("/api/addresses", methods=["POST"])
@auth_service.auth_required()
def add_address():
    data = request.get_json(silent=True) or {}
    try:
        res = address_service.add_address(
            user_id=request.current_user["user_id"],
            address_line1=data.get("address_line1"),
            city=data.get("city"),
            state=data.get("state"),
            zip_code=data.get("zip"),
            country=data.get("country", "India"),
            is_default=data.get("is_default", False)
        )
        return jsonify(res), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/addresses/<address_id>", methods=["DELETE"])
@auth_service.auth_required()
def delete_address(address_id):
    try:
        address_service.delete_address(address_id, request.current_user["user_id"])
        return jsonify({"message": "Address deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ==============================================================================
# 09. Payments & Shipping Logistics APIs
# ==============================================================================
@app.route("/api/payments/process", methods=["POST"])
@auth_service.auth_required()
def process_payment():
    data = request.get_json(silent=True) or {}
    payment_id = data.get("payment_id")
    method = data.get("method")
    txn_id = data.get("transaction_id")

    if not payment_id or not method or not txn_id:
        return jsonify({"error": "Missing payment details"}), 400

    try:
        payment_service.process_payment(payment_id, method, txn_id)
        # Once payment is COMPLETED, update order status to CONFIRMED
        payment = payment_service.get_payment_status(payment_id)
        order_id = payment["order_id"]
        order_service.update_order_status(order_id, "CONFIRMED")

        # Trigger shipping creation
        shipping_service.create_shipment(order_id)

        return jsonify({"message": "Payment processed and order confirmed", "payment_id": payment_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/shipping/<order_id>", methods=["GET"])
def get_shipping_track(order_id):
    res = shipping_service.get_tracking_info(order_id)
    if not res:
        return jsonify({"error": "Shipping details not found"}), 404
    return jsonify(res), 200

# ==============================================================================
# 10. User Feedback & Review APIs
# ==============================================================================
@app.route("/api/reviews", methods=["POST"])
@auth_service.auth_required()
def submit_review():
    data = request.get_json(silent=True) or {}
    try:
        res = review_service.submit_review(
            product_id=data.get("product_id"),
            user_id=request.current_user["user_id"],
            rating=int(data.get("rating", 0)),
            comment=data.get("comment", "")
        )
        return jsonify(res), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/reviews/<product_id>", methods=["GET"])
def get_reviews(product_id):
    return jsonify(review_service.get_product_reviews(product_id)), 200

# ==============================================================================
# 11. Marketing & Coupons APIs
# ==============================================================================
@app.route("/api/coupons/validate", methods=["POST"])
def validate_coupon():
    data = request.get_json(silent=True) or {}
    code = data.get("code")
    amount = data.get("order_amount")

    if not code or amount is None:
        return jsonify({"error": "Code and order amount required"}), 400

    try:
        res = coupon_service.validate_coupon(code, float(amount))
        return jsonify(res), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

# ==============================================================================
# 07. Live Test Suite Execution API (Slide 7 TC01-TC10)
# ==============================================================================
@app.route("/api/tests/run", methods=["POST"])
def run_tests_api():
    from backend.tests import test_suite
    results = test_suite.run_all_tests()
    return jsonify(results), 200

# ==============================================================================
# 08. Favicon Route
# ==============================================================================
@app.route("/favicon.ico")
@app.route("/favicon.svg")
def favicon():
    return send_from_directory(frontend_dir, "favicon.svg", mimetype="image/svg+xml")

# ==============================================================================
# Application Bootstrap
# ==============================================================================
def ensure_database_ready():
    """Ensures database tables and demo seed users exist without dropping existing data"""
    try:
        users = postgres_db.query_all("SELECT user_id FROM users LIMIT 1")
        if not users:
            from seeds.seed_data import seed_database
            logger.info("Initializing and seeding database for first run...")
            seed_database()
        else:
            logger.info("Database tables and seed data are active and ready.")
    except Exception as e:
        logger.info(f"Setting up schema: {e}")
        from seeds.seed_data import seed_database
        seed_database()

if __name__ == "__main__":
    ensure_database_ready()
    logger.info(f"Distributed Digital Commerce Platform running at http://127.0.0.1:{config.PORT}")
    logger.info(f"Interactive Swagger API UI available at http://127.0.0.1:{config.PORT}/docs")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
