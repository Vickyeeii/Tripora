import sys
import os
from pathlib import Path
import uuid
from datetime import datetime

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from middleware.db import SessionLocal
from auth.models import Guide
from apps.heritage.models import Heritage, HeritagePhoto
from apps.events.models import Event  # Added to resolve SQLAlchemy relationship
from middleware.security import hash_password

def seed_kerala_heritage():
    db: Session = SessionLocal()

    # 🔍 Ensure a guide exists to attach the heritage items to
    guide = db.query(Guide).filter(Guide.email == "guide@kerala-tourism.com").first()

    if not guide:
        guide = Guide(
            id=uuid.uuid4(),
            full_name="Kerala Regional Guide",
            email="guide@kerala-tourism.com",
            password_hash=hash_password("password123"),
            phone="9876543210",
            address="Kochi, Kerala",
            status=True,
            created_at=datetime.utcnow()
        )
        db.add(guide)
        db.commit()
        db.refresh(guide)
        print("✅ Created new guide for Kerala heritage.")

    heritage_data = [
        {
            "name": "Munroe Island",
            "description": "A hidden gem located at the confluence of the Ashtamudi Lake and the Kallada River, Munroe Island offers serene backwater experiences, far from the bustling crowds. Famous for its canal cruises and village life experiences.",
            "location_map": "https://maps.google.com/?q=Munroe+Island+Kerala",
            "short_description": "Serene backwater village known for its narrow canals and coir industry.",
            "historical_overview": "Named after Resident Colonel John Munro of the former Princely State of Travancore.",
            "cultural_significance": "Preserves the traditional Kerala village architecture and coir-making cottage industries.",
            "best_time_to_visit": "November to February",
            "image_url": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=800"
        },
        {
            "name": "Jatayu Earth's Center",
            "description": "A rock-theme sustainable tourism park featuring the world's largest bird sculpture. It offers a blend of mythology, adventure, and panoramic views of the surrounding hills.",
            "location_map": "https://maps.google.com/?q=Jatayu+Earths+Center+Chadayamangalam",
            "short_description": "Massive bird sculpture and adventure park based on the Ramayana epic.",
            "historical_overview": "Built over 10 years, it opened in 2018. The site is believed to be the spot where the mythical bird Jatayu fell after fighting Ravana.",
            "cultural_significance": "A symbol of women's safety and honor, inspired by Jatayu's sacrifice in the Ramayana.",
            "best_time_to_visit": "September to March",
            "image_url": "https://images.unsplash.com/photo-1626014903706-e7de14d2325c?auto=format&fit=crop&q=80&w=800"
        },
        {
            "name": "Muzhappilangad Drive-in Beach",
            "description": "Asia's longest drive-in beach, offering 4 km of firm sand where visitors can drive right along the coast of the Arabian Sea. A perfect spot for adventure seekers and sunset lovers.",
            "location_map": "https://maps.google.com/?q=Muzhappilangad+Drive-in+Beach",
            "short_description": "Asia's longest drive-in sandy beach in Kannur.",
            "historical_overview": "A natural phenomenon where the sand is so compact and firm that it can support the weight of heavy vehicles.",
            "cultural_significance": "A popular spot for beach festivals and automotive events in the Malabar region.",
            "best_time_to_visit": "October to May",
            "image_url": "https://images.unsplash.com/photo-1582049186632-15f106fdf245?auto=format&fit=crop&q=80&w=800"
        },
        {
            "name": "Vagamon Pine Forest",
            "description": "A picturesque, man-made pine forest in the hill station of Vagamon. It provides a cool, tranquil environment perfect for nature walks and photography, away from the typical tourist trails.",
            "location_map": "https://maps.google.com/?q=Vagamon+Pine+Forest",
            "short_description": "A serene, artificial pine forest ideal for peaceful walks and nature escapes.",
            "historical_overview": "Created during the British era to cultivate pine trees for timber, it has now transformed into a major eco-tourism site.",
            "cultural_significance": "A popular shooting location for South Indian films, showcasing the cooler, misty side of Kerala.",
            "best_time_to_visit": "September to May",
            "image_url": "https://images.unsplash.com/photo-1542289139-446757b3f07a?auto=format&fit=crop&q=80&w=800"
        },
        {
            "name": "Bekal Fort",
            "description": "The largest and best-preserved fort in Kerala, overlooking the Arabian Sea. Its keyhole-shaped structure, observation towers, and beautifully maintained grounds make it a majestic historical site.",
            "location_map": "https://maps.google.com/?q=Bekal+Fort+Kasaragod",
            "short_description": "A massive, 17th-century keyhole-shaped fort bordering the Arabian Sea.",
            "historical_overview": "Built in 1650 AD by Shivappa Nayaka of Keladi, later occupied by Hyder Ali, Tipu Sultan, and eventually the British East India Company.",
            "cultural_significance": "A testament to the rich military history and strategic importance of the Malabar coast.",
            "best_time_to_visit": "October to March",
            "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800"
        }
    ]

    for item in heritage_data:
        # Check if already exists
        existing = db.query(Heritage).filter(Heritage.name == item["name"]).first()
        if existing:
            print(f"⚠️ Heritage '{item['name']}' already exists. Skipping.")
            continue

        heritage = Heritage(
            id=uuid.uuid4(),
            guide_id=guide.id,
            name=item["name"],
            description=item["description"],
            location_map=item["location_map"],
            short_description=item["short_description"],
            historical_overview=item["historical_overview"],
            cultural_significance=item["cultural_significance"],
            best_time_to_visit=item["best_time_to_visit"],
            is_active=True,
            is_deleted=False,
            created_at=datetime.utcnow()
        )
        db.add(heritage)
        db.commit()
        db.refresh(heritage)

        # Add the photo
        photo = HeritagePhoto(
            id=uuid.uuid4(),
            heritage_id=heritage.id,
            image_url=item["image_url"],
            created_at=datetime.utcnow()
        )
        db.add(photo)
        db.commit()

        print(f"✅ Successfully added '{item['name']}' with image.")

    db.close()
    print("🎉 Kerala micro-tourism heritage seeding complete!")

if __name__ == "__main__":
    seed_kerala_heritage()
