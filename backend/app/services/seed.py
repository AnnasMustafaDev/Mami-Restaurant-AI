"""Seed database with initial data for development."""

import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.admin_user import AdminUser
from app.models.menu_item import MenuItem
from app.models.wine_pairing import WinePairing
from app.models.restaurant_table import RestaurantTable
from app.models.restaurant_config import RestaurantConfig


async def seed_database(db: AsyncSession):
    """Seed all tables with initial data. Skips if data already exists."""
    # Check if already seeded
    result = await db.execute(select(MenuItem).limit(1))
    if result.scalar_one_or_none():
        return  # Already seeded

    # --- Admin User ---
    admin = AdminUser(
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        role="admin",
    )
    db.add(admin)

    # --- Restaurant Tables ---
    tables = [
        RestaurantTable(table_number="T1", capacity=2),
        RestaurantTable(table_number="T2", capacity=2),
        RestaurantTable(table_number="T3", capacity=4),
        RestaurantTable(table_number="T4", capacity=4),
        RestaurantTable(table_number="T5", capacity=6),
        RestaurantTable(table_number="T6", capacity=6),
        RestaurantTable(table_number="T7", capacity=8),
        RestaurantTable(table_number="T8", capacity=10),
    ]
    db.add_all(tables)

    # --- Menu Items (from MaMi's Berlin) ---

    # NEBENBEI (Sides / Small Plates)
    nebenbei = [
        MenuItem(
            name="Brot",
            description="Frisches Brot mit Butter und Olivenöl",
            category="nebenbei",
            price=6.50,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
        MenuItem(
            name="Käseauswahl des Tages",
            description="Tagesaktuelle Auswahl feiner Käsesorten",
            category="nebenbei",
            price=23.00,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Kopfsalatherz",
            description="Knackiges Kopfsalatherz mit feinem Dressing",
            category="nebenbei",
            price=16.00,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Luftgetrockneter Iberico Schinken",
            description="Luftgetrockneter Iberico Schinken, hauchdünn geschnitten",
            category="nebenbei",
            price=23.50,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
        ),
    ]

    # KALT (Cold Dishes)
    kalt = [
        MenuItem(
            name="Gelbflossenmakrele",
            description="Frische Gelbflossenmakrele, fein angerichtet",
            category="kalt",
            price=32.00,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Kürbis",
            description="Saisonaler Kürbis, kalt zubereitet",
            category="kalt",
            price=21.00,
            dietary_tags=json.dumps(["vegan", "gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Faux-Gras",
            description="Pflanzliche Alternative zu Foie Gras",
            category="kalt",
            price=31.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
    ]

    # WARM (Warm Dishes)
    warm = [
        MenuItem(
            name="Zwiebelsuppe Hot Pot",
            description="Heiße Zwiebelsuppe im Hot Pot serviert",
            category="warm",
            price=15.00,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
        MenuItem(
            name="Pimientos de Padron",
            description="Gebratene Pimientos de Padron mit Meersalz",
            category="warm",
            price=18.50,
            dietary_tags=json.dumps(["vegan", "gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Rote Garnele",
            description="Rote Garnele, perfekt gebraten",
            category="warm",
            price=24.00,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="MaMi's Bolo",
            description="MaMi's hausgemachte Bolognese — unser Signature Gericht",
            category="warm",
            price=29.50,
            dietary_tags=json.dumps([]),
            is_available=1,
            is_special=1,
        ),
        MenuItem(
            name="Kartoffelpfannkuchen",
            description="Knusprige Kartoffelpfannkuchen, goldbraun gebraten",
            category="warm",
            price=24.00,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
        MenuItem(
            name="Spätzle",
            description="Handgemachte schwäbische Spätzle",
            category="warm",
            price=9.50,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
    ]

    # SÜSS (Desserts)
    suess = [
        MenuItem(
            name="Cheesecakecreme",
            description="Cremiger Cheesecake als Dessert",
            category="suess",
            price=13.00,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
        MenuItem(
            name="Weisse Schokolade",
            description="Weisse Schokolade Dessert, kunstvoll angerichtet",
            category="suess",
            price=14.50,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
        MenuItem(
            name="Weisses Schokosüppchen",
            description="Warmes Süppchen aus weisser Schokolade",
            category="suess",
            price=9.00,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
    ]

    # WINES (representative selection)
    wines = [
        MenuItem(
            name="Riesling Kabinett, Mosel 2022",
            description="Mosel — Frische Zitrus- und Pfirsichnoten, mineralisch mit feiner Restsüße",
            category="wine",
            price=42.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Grauburgunder Trocken, Pfalz 2022",
            description="Pfalz — Birne, Mandel und dezente Würze. Elegant und trocken.",
            category="wine",
            price=38.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Spätburgunder Reserve, Baden 2020",
            description="Baden — Kirsche, Waldbeeren und feine Eichenholznote. Samtiger Körper.",
            category="wine",
            price=55.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Chianti Classico Riserva 2019",
            description="Toskana — Kirsche, Leder und getrocknete Kräuter. Mittelvoll mit eleganten Tanninen.",
            category="wine",
            price=58.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Prosecco Superiore DOCG",
            description="Veneto — Grüner Apfel, weiße Blüten und feine Perlage. Perfekter Aperitivo.",
            category="wine",
            price=36.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
    ]

    all_items = nebenbei + kalt + warm + suess + wines
    db.add_all(all_items)
    await db.flush()  # Get IDs assigned

    # --- Wine Pairings ---
    item_map = {item.name: item for item in all_items}

    pairings = [
        # MaMi's Bolo with Chianti
        WinePairing(
            dish_id=item_map["MaMi's Bolo"].id,
            wine_id=item_map["Chianti Classico Riserva 2019"].id,
            notes="Toskanischer Wein trifft auf Bolognese — die Säure harmoniert perfekt",
        ),
        # MaMi's Bolo with Spätburgunder
        WinePairing(
            dish_id=item_map["MaMi's Bolo"].id,
            wine_id=item_map["Spätburgunder Reserve, Baden 2020"].id,
            notes="Weiche Kirschnoten ergänzen die reiche Fleischsauce",
        ),
        # Gelbflossenmakrele with Riesling
        WinePairing(
            dish_id=item_map["Gelbflossenmakrele"].id,
            wine_id=item_map["Riesling Kabinett, Mosel 2022"].id,
            notes="Frischer Riesling mit Zitrusnoten passt wunderbar zum rohen Fisch",
        ),
        # Rote Garnele with Grauburgunder
        WinePairing(
            dish_id=item_map["Rote Garnele"].id,
            wine_id=item_map["Grauburgunder Trocken, Pfalz 2022"].id,
            notes="Eleganter Grauburgunder begleitet die zarte Garnele harmonisch",
        ),
        # Käseauswahl with Spätburgunder
        WinePairing(
            dish_id=item_map["Käseauswahl des Tages"].id,
            wine_id=item_map["Spätburgunder Reserve, Baden 2020"].id,
            notes="Weicher Spätburgunder verbindet sich perfekt mit feinem Käse",
        ),
        # Faux-Gras with Riesling
        WinePairing(
            dish_id=item_map["Faux-Gras"].id,
            wine_id=item_map["Riesling Kabinett, Mosel 2022"].id,
            notes="Die feine Süße des Rieslings ergänzt die cremige Textur",
        ),
    ]
    db.add_all(pairings)

    # --- Restaurant Config ---
    configs = [
        RestaurantConfig(
            key="hours",
            value=json.dumps({
                "monday": "closed",
                "tuesday": "18:00-00:00",
                "wednesday": "18:00-00:00",
                "thursday": "18:00-00:00",
                "friday": "18:00-01:00",
                "saturday": "18:00-01:00",
                "sunday": "closed",
            }),
        ),
        RestaurantConfig(
            key="location",
            value=json.dumps({
                "address": "Oderberger Straße 13",
                "city": "Berlin",
                "state": "Berlin",
                "zip": "10435",
                "phone": "+49 30 239 165 67",
                "email": "hello@mamis-berlin.de",
            }),
        ),
        RestaurantConfig(
            key="about",
            value=json.dumps({
                "hero_subtitle": "Seit 2019 — Berlin Prenzlauer Berg",
                "hero_title": "Our Story",
                "hero_description": "A family-run bistro where warm hospitality meets exceptional cuisine",
                "story_label": "Das Herz von MaMi's",
                "story_title": "Willkommen bei Marcel & Miriam",
                "story_paragraphs": [
                    "MaMi's Food & Wine ist ein Restaurant in Berlin Prenzlauer Berg, das warme Gastlichkeit mit außergewöhnlicher Küche verbindet. Gegründet von Marcel und Miriam, erzählt jedes Gericht eine Geschichte von Tradition, Leidenschaft und den feinsten saisonalen Zutaten.",
                    "Mitten im Prenzlauer Berg, an der Oderberger Straße 13, heißen wir euch seit 2019 willkommen. Unsere Küche verbindet saisonale Rezepte mit mediterranem Flair — ehrlich, kreativ und immer mit Herz zubereitet.",
                    "Unser Weinprogramm feiert Europas vielfältige Weinlandschaften — von deutschen Rieslingen bis zu toskanischen Klassikern. Jede Flasche ist handverlesen und perfekt auf unsere Gerichte abgestimmt.",
                ],
                "story_image_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
                "values": [
                    {"icon": "Heart", "title": "Passion", "desc": "Every dish is made with love and generations of Italian culinary wisdom."},
                    {"icon": "Leaf", "title": "Seasonal", "desc": "We source the freshest local ingredients, changing our menu with the seasons."},
                    {"icon": "Users", "title": "Family", "desc": "Our bistro is an extension of our family table — everyone is welcome."},
                    {"icon": "Award", "title": "Excellence", "desc": "We hold ourselves to the highest standards in every plate we serve."},
                ],
                "milestones": [
                    {"year": "2018", "title": "Die Idee", "desc": "Marcel und Miriam träumen von einem Ort, wo gutes Essen und guter Wein die Menschen zusammenbringen."},
                    {"year": "2019", "title": "Die Eröffnung", "desc": "MaMi's Food & Wine öffnet seine Türen in der Oderberger Straße 13, Prenzlauer Berg, Berlin."},
                    {"year": "2021", "title": "Das Weinprogramm", "desc": "Wir starten unser kuratiertes Naturweinprogramm mit handverlesenen Weinen aus Deutschland und Europa."},
                    {"year": "2024", "title": "Sofia tritt dem Team bei", "desc": "Unsere KI-Gastgeberin Sofia begleitet euch durch Menü und Reservierungen — auf Deutsch und Englisch."},
                ],
                "chef": {
                    "label": "Unsere Gastgeber",
                    "name": "Marcel & Miriam",
                    "paragraph1": "MaMi's steht für Marcel und Miriam — zwei Menschen mit einer tiefen Leidenschaft für gutes Essen, natürliche Weine und echte Gastfreundschaft.",
                    "paragraph2": "Ihre Philosophie ist einfach: qualitativ hochwertige, saisonale Zutaten, mit Liebe zubereitet und in entspannter Atmosphäre serviert. Jeder Abend bei MaMi's soll sich anfühlen wie ein Abend bei Freunden.",
                    "image_url": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80",
                },
            }),
        ),
        RestaurantConfig(
            key="contact",
            value=json.dumps({
                "address_lines": ["Oderberger Straße 13", "10435 Berlin"],
                "phone": "+49 30 239 165 67",
                "email": "hello@mamis-berlin.de",
                "hours": [
                    "Montag: Geschlossen",
                    "Di — Do: 18:00 — 00:00",
                    "Freitag: 18:00 — 01:00",
                    "Samstag: 18:00 — 01:00",
                    "Sonntag: Geschlossen",
                ],
                "map_address": "Oderberger Straße 13, 10435 Berlin",
            }),
        ),
        RestaurantConfig(
            key="booking_settings",
            value=json.dumps({
                "slot_duration_minutes": 30,
                "first_slot": "18:00",
                "last_slot": "22:00",
                "max_party_size": 10,
            }),
        ),
    ]
    db.add_all(configs)

    await db.commit()
    print("Database seeded successfully!")
