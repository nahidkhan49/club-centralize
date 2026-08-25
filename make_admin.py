import sys
from app.db.database import SessionLocal
from app.models.user import User

def make_admin(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username.strip()).first()
        if not user:
            print(f"❌ Error: User '{username}' not found in database.")
            return False
        user.is_superuser = True
        db.commit()
        print(f"✅ Success: User '{username}' (email: {user.email}) is now a Superuser / Admin!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <username>")
        print("Example: python make_admin.py nahid")
    else:
        make_admin(sys.argv[1])
