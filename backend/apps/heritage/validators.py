from pydantic import field_validator, HttpUrl
from apps.heritage.schemas import HeritageCreate, HeritageUpdate, PhotoCreate


# Add validators to schemas
class HeritageCreateValidated(HeritageCreate):
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Name must be at least 3 characters')
        if len(v) > 150:
            raise ValueError('Name must not exceed 150 characters')
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Description must be at least 10 characters')
        return v.strip()
    
    @field_validator('location_map')
    @classmethod
    def validate_location(cls, v):
        # Basic URL validation or coordinate format
        if not v.strip():
            raise ValueError('Location map URL is required')
        return v.strip()


class PhotoCreateValidated(PhotoCreate):
    @field_validator('image_url')
    @classmethod
    def validate_image_url(cls, v):
        if not v.strip():
            raise ValueError('Image URL is required')
        # Add URL format validation or file extension check
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        if not any(v.lower().endswith(ext) for ext in allowed_extensions):
            raise ValueError(f'Image must be one of: {", ".join(allowed_extensions)}')
        return v.strip()
