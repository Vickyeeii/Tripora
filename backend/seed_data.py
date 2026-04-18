import uuid
import random
from datetime import date, time, timedelta, datetime
import logging

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    PASSWORD_HASH = pwd_context.hash("password")
except ImportError:
    # Fallback to a known bcrypt hash for "password" if passlib is missing
    PASSWORD_HASH = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG8.R7q"

from middleware.db import SessionLocal
from auth.models import Admin, Guide, Tourist
from apps.heritage.models import Heritage
from apps.bookings.models import Booking
from apps.feedbacks.models import Feedback
from apps.complaints.models import Complaint
from apps.events.models import Event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Predefined UUIDs
ADMIN_ID = uuid.UUID("5dad40ca-d18d-48e8-90b7-833cced2b5e8")
MAIN_GUIDE_ID = uuid.UUID("78b79642-d5ba-43da-b3d4-6cf580dd9019")
MAIN_TOURIST_ID = uuid.UUID("72f33180-c20e-4bd5-b2db-dcb1bb9e832f")

def generate_reference_code():
    return f"REF-{uuid.uuid4().hex[:8].upper()}"

def seed_database():
    db = SessionLocal()
    try:
        logger.info("Starting database seeding...")

        # --- 1. USERS ---
        logger.info("Seeding Users...")
        # Admin
        admin = db.query(Admin).filter_by(id=ADMIN_ID).first()
        if not admin:
            admin = Admin(
                id=ADMIN_ID,
                full_name="System Admin",
                email="admin@tripora.com",
                password_hash=PASSWORD_HASH,
                phone="9876543210"
            )
            db.add(admin)

        # Guides
        main_guide = db.query(Guide).filter_by(id=MAIN_GUIDE_ID).first()
        if not main_guide:
            main_guide = Guide(
                id=MAIN_GUIDE_ID,
                full_name="Prakash Menon",
                email="prakash@tripora.com",
                password_hash=PASSWORD_HASH,
                phone="9447000001",
                address="Near Vadakkunnathan Temple, Thrissur",
                status=True,
                approved_by=ADMIN_ID
            )
            db.add(main_guide)

        guide2 = Guide(id=uuid.uuid4(), full_name="Sanjay Kumaran", email="sanjay@tripora.com", password_hash=PASSWORD_HASH, phone="9447000002", address="Punkunnam, Thrissur", status=True, approved_by=ADMIN_ID)
        guide3 = Guide(id=uuid.uuid4(), full_name="Meenakshi Iyer", email="meenakshi@tripora.com", password_hash=PASSWORD_HASH, phone="9447000003", address="Guruvayur Road, Thrissur", status=True, approved_by=ADMIN_ID)
        
        # Check if guide2 equivalent exists by email, if we rerun we might duplicate, so we check.
        if not db.query(Guide).filter_by(email="sanjay@tripora.com").first():
            db.add(guide2)
            db.add(guide3)

        # Tourists
        main_tourist = db.query(Tourist).filter_by(id=MAIN_TOURIST_ID).first()
        if not main_tourist:
            main_tourist = Tourist(
                id=MAIN_TOURIST_ID,
                full_name="Aswin M",
                email="aswin@tripora.com",
                password_hash=PASSWORD_HASH,
                phone="9998887776",
                country="India",
                preferred_language="Malayalam"
            )
            db.add(main_tourist)
            
        tourist_data = [
            ("Rahul Nair", "rahul@example.com", "9998887771", "India", "English"),
            ("Sneha George", "sneha@example.com", "9998887772", "USA", "English"),
            ("Arjun Das", "arjun@example.com", "9998887773", "UAE", "Malayalam"),
            ("Lisa Thomas", "lisa@example.com", "9998887774", "UK", "English"),
            ("Mohammed Shafi", "shafi@example.com", "9998887775", "Qatar", "Arabic"),
        ]
        
        new_tourist_ids = []
        for name, email, phone, ctry, lang in tourist_data:
            t = db.query(Tourist).filter_by(email=email).first()
            if not t:
                new_t_id = uuid.uuid4()
                t = Tourist(id=new_t_id, full_name=name, email=email, password_hash=PASSWORD_HASH, phone=phone, country=ctry, preferred_language=lang)
                db.add(t)
                new_tourist_ids.append(new_t_id)
            else:
                new_tourist_ids.append(t.id)

        db.commit()

        # Grab all guides that were just saved to get their actual IDs
        all_guides = db.query(Guide).all()
        guide_ids = [g.id for g in all_guides if g.id != MAIN_GUIDE_ID]
        if not guide_ids:
            guide_ids = [MAIN_GUIDE_ID] # fallback if something weird happens

        # --- 2. HERITAGE ---
        logger.info("Seeding Heritage Locations...")
        heritage_list = [
            {
                "guide_id": MAIN_GUIDE_ID,
                "name": "Vadakkunnathan Temple",
                "description": "An ancient Hindu temple dedicated to Shiva at city centre of Thrissur.",
                "short_description": "Historic Shiva Temple known for its architecture.",
                "historical_overview": "One of the oldest temples in Kerala, believed to have been founded by Parashurama.",
                "cultural_significance": "Hosts the spectacular Thrissur Pooram festival. Recognized by UNESCO for heritage conservation.",
                "best_time_to_visit": "April-May during Thrissur Pooram, or morning hours year-round.",
                "location_map": "https://maps.google.com/?q=Vadakkunnathan+Temple",
            },
            {
                "guide_id": MAIN_GUIDE_ID,
                "name": "Shakthan Thampuran Palace",
                "description": "A historic palace that highlights the architectural style of Kerala.",
                "short_description": "Palace of the former ruler of Cochin.",
                "historical_overview": "Reconstructed in 1795 by Ramavarma Thampuran in Kerala-Dutch style.",
                "cultural_significance": "A symbol of the Cochin Royal Family's legacy in Thrissur.",
                "best_time_to_visit": "September to March.",
                "location_map": "https://maps.google.com/?q=Shakthan+Thampuran+Palace",
            },
            {
                "guide_id": MAIN_GUIDE_ID,
                "name": "Athirappilly Waterfalls",
                "description": "The largest waterfall in Kerala, often referred to as the Niagara of India.",
                "short_description": "80-foot high waterfall in the Chalakudy River.",
                "historical_overview": "Formed naturally along the Western Ghats landscape, long valued by local tribes.",
                "cultural_significance": "Popular filming location for many Indian movies.",
                "best_time_to_visit": "September to January (post-monsoon).",
                "location_map": "https://maps.google.com/?q=Athirappilly+Waterfalls",
            },
            {
                "guide_id": MAIN_GUIDE_ID,
                "name": "Basilica of Our Lady of Dolours",
                "description": "The biggest church in India and the third tallest church in Asia.",
                "short_description": "Gothic style Catholic basilica.",
                "historical_overview": "Construction of this massive structure started in 1929.",
                "cultural_significance": "An architectural marvel representing Christian heritage in central Kerala.",
                "best_time_to_visit": "Sundays and festive seasons like Christmas.",
                "location_map": "https://maps.google.com/?q=Basilica+of+Our+Lady+of+Dolours",
            },
            {
                "guide_id": MAIN_GUIDE_ID,
                "name": "Punnathur Kotta (Elephant Camp)",
                "description": "An elephant sanctuary preserving over 50 elephants near Guruvayur.",
                "short_description": "Sanctuary for Guruvayur temple elephants.",
                "historical_overview": "Originally a palace of a local ruler, now belonging to the Guruvayur Sri Krishna Temple.",
                "cultural_significance": "Deeply tied to Kerala's tradition of capturing and taming elephants for temple festivals.",
                "best_time_to_visit": "Morning or early afternoon.",
                "location_map": "https://maps.google.com/?q=Punnathur+Kotta",
            },
            {
                "guide_id": guide_ids[0] if len(guide_ids) > 0 else MAIN_GUIDE_ID,
                "name": "Peechi Dam & Wildlife Sanctuary",
                "description": "An extensive irrigation project with boating facilities set alongside a wildlife sanctuary.",
                "short_description": "Scenic dam and nature reserve.",
                "historical_overview": "Constructed in the 1950s to cater to the irrigation needs of Thrissur.",
                "cultural_significance": "A tranquil escape for locals, preserving rich biodiversity in the region.",
                "best_time_to_visit": "October to March.",
                "location_map": "https://maps.google.com/?q=Peechi+Dam",
            },
            {
                "guide_id": guide_ids[0] if len(guide_ids) > 0 else MAIN_GUIDE_ID,
                "name": "Kerala Kalamandalam",
                "description": "The premiere public institution for preserving Kerala's performing arts.",
                "short_description": "University of Art and Culture.",
                "historical_overview": "Founded in 1930 by poet Vallathol Narayana Menon.",
                "cultural_significance": "The cradle of Kathakali, Mohiniyattam, and Koodiyattam.",
                "best_time_to_visit": "Weekdays during regular session hours.",
                "location_map": "https://maps.google.com/?q=Kerala+Kalamandalam",
            },
            {
                "guide_id": guide_ids[-1] if len(guide_ids) > 0 else MAIN_GUIDE_ID,
                "name": "Vilangan Hills",
                "description": "A popular picnic spot known as the 'Oxygen Jar' of Thrissur city.",
                "short_description": "Hillock offering panoramic views.",
                "historical_overview": "Developed over recent decades as a major tourist viewpoint.",
                "cultural_significance": "Provides space for local gatherings, fitness, and nature walks.",
                "best_time_to_visit": "Evenings before sunset.",
                "location_map": "https://maps.google.com/?q=Vilangan+Hills",
            },
            {
                "guide_id": guide_ids[-1] if len(guide_ids) > 0 else MAIN_GUIDE_ID,
                "name": "Archaeological Museum, Thrissur",
                "description": "A museum displaying murals and relics from different periods of Kerala's history.",
                "short_description": "Rich collection of ancient artifacts.",
                "historical_overview": "Transferred to the current building in 1975, displaying excavated materials.",
                "cultural_significance": "Crucial for scholars and tourists wanting to understand the history of central Kerala.",
                "best_time_to_visit": "Daytime during weekdays.",
                "location_map": "https://maps.google.com/?q=Archaeological+Museum+Thrissur",
            },
            {
                "guide_id": guide_ids[-1] if len(guide_ids) > 0 else MAIN_GUIDE_ID,
                "name": "Mural Art Museum",
                "description": "The only museum in Kerala dedicated exclusively to mural arts.",
                "short_description": "Preserving ancient wall paintings.",
                "historical_overview": "Established preserving murals discovered from various temples.",
                "cultural_significance": "Protects the vanishing art form of natural color paintings seen in temples.",
                "best_time_to_visit": "Open mostly all days except Mondays.",
                "location_map": "https://maps.google.com/?q=Mural+Art+Museum",
            }
        ]

        heritage_db_objects = []
        for h_data in heritage_list:
            h = db.query(Heritage).filter_by(name=h_data["name"]).first()
            if not h:
                h = Heritage(
                    id=uuid.uuid4(),
                    is_active=True,
                    **h_data
                )
                db.add(h)
                heritage_db_objects.append(h)
            else:
                h.is_active = True
                heritage_db_objects.append(h)
        db.commit()

        # Reload added heritages
        heritages = db.query(Heritage).all()

        # --- 3. BOOKINGS ---
        logger.info("Seeding Bookings...")
        # Make a mix of bookings
        booking_objects = []

        if not db.query(Booking).first(): # Seed only if empty
            for i in range(12):
                h = random.choice(heritages)
                is_authenticated = random.choice([True, False])
                b_status = random.choice(["pending", "confirmed", "confirmed", "confirmed", "cancelled"]) # Bias towards confirmed for feedbacks
                
                b = Booking(
                    id=uuid.uuid4(),
                    reference_code=generate_reference_code(),
                    heritage_id=h.id,
                    visitor_name=f"Visitor {i+1}",
                    visitor_phone=f"90000000{i:02d}",
                    visitor_email=f"visitor{i+1}@example.com" if is_authenticated else None,
                    visit_date=date.today() + timedelta(days=random.randint(-10, 10)),
                    visit_time=time(hour=random.randint(9, 16), minute=0),
                    people_count=random.randint(1, 5),
                    status=b_status,
                    notes="Looking forward to this visit."
                )

                if i < 4: # First 4 are the main tourist
                    b.created_by_role = "tourist"
                    b.created_by_id = MAIN_TOURIST_ID
                    b.visitor_name = "Aswin M"
                    b.visitor_email = "aswin@tripora.com"
                    b.status = "confirmed" # Ensure confirmed for feedbacks
                elif is_authenticated:
                    b.created_by_role = "tourist"
                    b.created_by_id = random.choice(new_tourist_ids)
                else:
                    b.created_by_role = "guest"
                    b.created_by_id = None
                
                db.add(b)
                booking_objects.append(b)
            db.commit()

        # --- 4. FEEDBACKS ---
        logger.info("Seeding Feedbacks...")
        if not db.query(Feedback).first():
            bookings = db.query(Booking).filter_by(status="confirmed").all()
            feedback_comments = [
                "Absolutely loved the peace and architecture here.",
                "The guide was amazing and explained everything neatly.",
                "A bit crowded but definitely worth the visit.",
                "Great historical significance, would visit again.",
                "Well maintained and a very spiritual atmosphere.",
                "Not bad, but parking was a slight issue.",
                "Incredible artifacts, so rich in culture.",
                "Fascinating insights into the history of the royals.",
                "Stunning views from the top, Highly recommended!",
                "Truly a magnificent piece of Kerala's heritage."
            ]

            for i, b in enumerate(bookings[:10]): # Ensure at least 10 if enough bookings exist
                f_rating = random.randint(3, 5)
                f = Feedback(
                    id=uuid.uuid4(),
                    booking_id=b.id,
                    heritage_id=b.heritage_id,
                    tourist_id=b.created_by_id if b.created_by_role == "tourist" else None,
                    reference_code=b.reference_code if b.created_by_role == "guest" else None,
                    rating=f_rating,
                    title=f"Great Experience at {f_rating} stars",
                    comment=random.choice(feedback_comments),
                    is_visible=random.choice([True, True, False]) # Mix, mostly visible
                )
                db.add(f)
            db.commit()

        # --- 5. COMPLAINTS ---
        logger.info("Seeding Complaints...")
        if not db.query(Complaint).first():
            all_bookings = db.query(Booking).all()
            complaint_texts = [
                ("Delay in response", "I tried reaching the contact number but no one picked up for an hour.", "open"),
                ("Wrong location on map", "The Google Maps link sent me to the wrong entrance.", "in_progress"),
                ("Guide was late", "The guide assigned to us arrived 30 minutes late.", "resolved"),
                ("Crowd management", "During the weekend it was too crowded with no proper lines.", "open"),
                ("Cleanliness issue", "The restrooms near the entrance were not clean.", "resolved"),
                ("Ticket pricing", "The price for foreign tourists is too high.", "closed"),
                ("No drinking water", "There were no water facilities available during the afternoon walk.", "resolved"),
                ("Audio guide not working", "The audio device provided had a lot of static.", "in_progress"),
                ("Rude behavior", "Security staff was a bit rude while asking us to move.", "open"),
                ("Parking fee discrepancy", "Was charged more than the displayed parking rate.", "closed"),
            ]

            for i, (subj, desc, status) in enumerate(complaint_texts):
                b = random.choice(all_bookings)
                
                # Make sure some belong to main tourist and main guide's heritage
                if i < 3: 
                    # Main tourist complaint
                    c_tourist = MAIN_TOURIST_ID
                    c_role = "tourist"
                    c_ref = None
                else:
                    c_role = random.choice(["tourist", "guest"])
                    if c_role == "tourist":
                        c_tourist = random.choice(new_tourist_ids)
                        c_ref = None
                    else:
                        c_tourist = None
                        c_ref = b.reference_code

                c = Complaint(
                    id=uuid.uuid4(),
                    reference_code=c_ref,
                    tourist_id=c_tourist,
                    heritage_id=b.heritage_id,
                    booking_id=b.id,
                    subject=subj,
                    description=desc,
                    status=status,
                    admin_reply="We sincerely apologize and are investigating this matter." if status in ["resolved", "closed", "in_progress"] else None,
                    created_by_role=c_role
                )
                db.add(c)
            db.commit()
            
        logger.info("Database seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
