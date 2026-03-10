from typing import Generic, TypeVar, List
from pydantic import BaseModel
from sqlalchemy.orm import Query

T = TypeVar('T')


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        return self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    class Config:
        from_attributes = True


def paginate(query: Query, params: PaginationParams, response_model):
    """
    Paginate a SQLAlchemy query.
    
    Usage:
        query = db.query(Heritage).filter(...)
        return paginate(query, PaginationParams(page=1, page_size=20), HeritageResponse)
    """
    total = query.count()
    items = query.offset(params.offset).limit(params.limit).all()
    
    total_pages = (total + params.page_size - 1) // params.page_size
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=total_pages
    )
