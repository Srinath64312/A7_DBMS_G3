from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from shared.config_base import settings
from services.catalog import catalog, reviews, intelligence

app = FastAPI(title="Catalog Microservice")

# --- Schemas ---
class ProductCreate(BaseModel):
    name: str
    category_id: str
    sku: str
    price: float
    description: Optional[str] = ""
    attributes: Optional[dict] = {}
    supplier_id: Optional[str] = ""
    tags: Optional[List[str]] = []
    image_url: Optional[str] = ""

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    attributes: Optional[dict] = None
    tags: Optional[List[str]] = None

class ReviewSubmit(BaseModel):
    product_id: str
    user_id: str
    rating: int
    comment: str

# --- Routes ---

@app.get("/categories")
def list_categories():
    return catalog.get_categories()

@app.get("/products")
def list_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    tag: Optional[str] = None
):
    return catalog.get_products(category_id, search, tag)

@app.get("/products/{product_id}")
def get_product(product_id: str):
    product = catalog.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products")
def create_product(prod: ProductCreate):
    try:
        return catalog.create_product(**prod.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/products/{product_id}")
def update_product(product_id: str, prod: ProductUpdate):
    try:
        return catalog.update_product(product_id, **prod.dict(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/products/{product_id}/recommendations")
def get_recommendations(product_id: str, limit: int = 4):
    return intelligence.get_product_recommendations(product_id, limit)

@app.get("/products/{product_id}/reviews")
def get_reviews(product_id: str):
    return reviews.get_product_reviews(product_id)

@app.get("/products/{product_id}/rating")
def get_rating(product_id: str):
    return {"product_id": product_id, "average_rating": reviews.get_average_rating(product_id)}

@app.post("/reviews")
def submit_review(rev: ReviewSubmit):
    try:
        return reviews.submit_review(rev.product_id, rev.user_id, rev.rating, rev.comment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=8002)
