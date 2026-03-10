from contextlib import asynccontextmanager
import uvicorn
from middleware.db import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.complaints.routers import router as complaint_router
from apps.events.routers import router as event_router
from apps.feedbacks.routers import router as feedback_router
from apps.heritage.routers import router as heritage_router
from apps.bookings.routers import router as booking_router
from apps.payments.routers import router as payment_router
from apps.notifications.routers import router as notification_router
from apps.dashboard.routers import router as dashboard_router
# from apps.visitorqueue.routers import router as visitorqueue_router
from auth.routers import router as auth_router
from apps.users.routers import router as user_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: Clean up if needed
    pass

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaint_router)
app.include_router(event_router)
app.include_router(feedback_router)
app.include_router(heritage_router)
app.include_router(booking_router)
app.include_router(payment_router)
app.include_router(notification_router)
app.include_router(dashboard_router)
# app.include_router(visitorqueue_router)
app.include_router(auth_router)
app.include_router(user_router)


@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
