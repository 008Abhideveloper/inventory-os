from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas

# --- Users ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Products ---
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False

# --- Customers ---
def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return True
    return False

# --- Orders ---
def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def create_order(db: Session, order: schemas.OrderCreate):
    # Verify customer
    db_customer = get_customer(db, order.customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0.0
    order_items_data = []

    # Verify inventory and calculate total
    for item in order.items:
        db_product = get_product(db, item.product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
        if db_product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product: {db_product.name}")
        
        # Calculate price and deduct stock
        price = db_product.price
        total_amount += price * item.quantity
        db_product.quantity -= item.quantity
        
        order_items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_time": price
        })

    # Create Order
    db_order = models.Order(customer_id=order.customer_id, total_amount=total_amount)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create Order Items
    for item_data in order_items_data:
        db_order_item = models.OrderItem(order_id=db_order.id, **item_data)
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        # Optionally restore inventory here if required. Requirements don't explicitly state.
        # Let's restore inventory on delete just to be robust.
        for item in db_order.items:
            db_product = get_product(db, item.product_id)
            if db_product:
                db_product.quantity += item.quantity

        db.delete(db_order)
        db.commit()
        return True
    return False

def get_dashboard_summary(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock_products = db.query(models.Product).filter(models.Product.quantity < 5).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }
