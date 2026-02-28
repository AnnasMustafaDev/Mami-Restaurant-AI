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

    # --- Menu Items ---
    starters = [
        MenuItem(
            name="Bruschetta al Pomodoro",
            description="Toasted sourdough with fresh tomatoes, basil, garlic, and extra virgin olive oil",
            category="starter",
            price=12.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Burrata e Prosciutto",
            description="Creamy burrata with San Daniele prosciutto, arugula, and aged balsamic",
            category="starter",
            price=18.00,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Carpaccio di Manzo",
            description="Thinly sliced raw beef with capers, Parmigiano, truffle oil, and lemon",
            category="starter",
            price=19.00,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Arancini",
            description="Crispy saffron risotto balls stuffed with mozzarella and ragù",
            category="starter",
            price=14.00,
            dietary_tags=json.dumps([]),
            is_available=1,
        ),
    ]

    mains = [
        MenuItem(
            name="Ossobuco alla Milanese",
            description="Braised veal shank with saffron risotto and gremolata",
            category="main",
            price=36.00,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
            is_special=1,
        ),
        MenuItem(
            name="Branzino al Forno",
            description="Oven-roasted whole sea bass with roasted potatoes, olives, and capers",
            category="main",
            price=32.00,
            dietary_tags=json.dumps(["gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Tagliatelle al Ragù",
            description="Fresh egg pasta with slow-cooked Bolognese ragù and Parmigiano",
            category="main",
            price=24.00,
            dietary_tags=json.dumps([]),
            is_available=1,
        ),
        MenuItem(
            name="Risotto ai Funghi Porcini",
            description="Creamy Carnaroli rice with wild porcini mushrooms and truffle oil",
            category="main",
            price=26.00,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Melanzane alla Parmigiana",
            description="Layered eggplant with tomato sauce, mozzarella, and basil",
            category="main",
            price=22.00,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
    ]

    desserts = [
        MenuItem(
            name="Tiramisù della Casa",
            description="Our signature tiramisu with mascarpone, espresso, and cocoa",
            category="dessert",
            price=14.00,
            dietary_tags=json.dumps(["vegetarian"]),
            is_available=1,
        ),
        MenuItem(
            name="Panna Cotta",
            description="Vanilla bean panna cotta with seasonal berry compote",
            category="dessert",
            price=12.00,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            is_available=1,
        ),
        MenuItem(
            name="Affogato al Caffè",
            description="Vanilla gelato drowned in a shot of hot espresso",
            category="dessert",
            price=10.00,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            is_available=1,
        ),
    ]

    wines = [
        MenuItem(
            name="Chianti Classico Riserva 2019",
            description="Tuscany — Cherry, leather, and dried herbs. Medium-full body with elegant tannins.",
            category="wine",
            price=58.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Barolo DOCG 2018",
            description="Piedmont — Rose, tar, and dark cherry. Full-bodied with firm tannins. Pairs beautifully with red meats.",
            category="wine",
            price=85.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Vermentino di Sardegna 2022",
            description="Sardinia — Citrus, white peach, and Mediterranean herbs. Crisp and refreshing.",
            category="wine",
            price=42.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Prosecco Superiore DOCG",
            description="Veneto — Green apple, white flowers, and fine bubbles. Perfect aperitivo.",
            category="wine",
            price=38.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
        MenuItem(
            name="Amarone della Valpolicella 2017",
            description="Veneto — Dried fruit, chocolate, and spice. Rich and velvety full body.",
            category="wine",
            price=95.00,
            dietary_tags=json.dumps(["vegan"]),
            is_available=1,
        ),
    ]

    all_items = starters + mains + desserts + wines
    db.add_all(all_items)
    await db.flush()  # Get IDs assigned

    # --- Wine Pairings ---
    # Map names to items for easy reference
    item_map = {item.name: item for item in all_items}

    pairings = [
        # Ossobuco pairs with Barolo and Amarone
        WinePairing(
            dish_id=item_map["Ossobuco alla Milanese"].id,
            wine_id=item_map["Barolo DOCG 2018"].id,
            notes="Classic Piedmontese pairing — the Barolo's tannins complement the rich veal",
        ),
        WinePairing(
            dish_id=item_map["Ossobuco alla Milanese"].id,
            wine_id=item_map["Amarone della Valpolicella 2017"].id,
            notes="A bold match — dried fruit richness mirrors the braised meat",
        ),
        # Branzino with Vermentino
        WinePairing(
            dish_id=item_map["Branzino al Forno"].id,
            wine_id=item_map["Vermentino di Sardegna 2022"].id,
            notes="Mediterranean white with Mediterranean fish — a natural harmony",
        ),
        # Tagliatelle with Chianti
        WinePairing(
            dish_id=item_map["Tagliatelle al Ragù"].id,
            wine_id=item_map["Chianti Classico Riserva 2019"].id,
            notes="Tuscan ragù meets Tuscan wine — the tomato acidity matches perfectly",
        ),
        # Risotto with Vermentino
        WinePairing(
            dish_id=item_map["Risotto ai Funghi Porcini"].id,
            wine_id=item_map["Vermentino di Sardegna 2022"].id,
            notes="Light citrus freshness cuts through the earthy mushroom richness",
        ),
        # Bruschetta with Prosecco
        WinePairing(
            dish_id=item_map["Bruschetta al Pomodoro"].id,
            wine_id=item_map["Prosecco Superiore DOCG"].id,
            notes="Bubbly aperitivo with a classic starter — light and festive",
        ),
    ]
    db.add_all(pairings)

    # --- Restaurant Config ---
    configs = [
        RestaurantConfig(
            key="hours",
            value=json.dumps({
                "monday": "closed",
                "tuesday": "17:00-22:00",
                "wednesday": "17:00-22:00",
                "thursday": "17:00-22:00",
                "friday": "17:00-23:00",
                "saturday": "12:00-23:00",
                "sunday": "12:00-21:00",
            }),
        ),
        RestaurantConfig(
            key="location",
            value=json.dumps({
                "address": "123 Wine Street, Little Italy",
                "city": "New York",
                "state": "NY",
                "zip": "10013",
                "phone": "+1 (212) 555-MAMI",
                "email": "hello@mamisfoodandwine.com",
            }),
        ),
        RestaurantConfig(
            key="about",
            value=json.dumps({
                "tagline": "Where every meal is a conversation",
                "story": "MaMi's Food & Wine is a family-run Italian-Mediterranean bistro where warm hospitality meets exceptional cuisine. Founded by Mamma Maria, every dish tells a story of tradition, passion, and the finest seasonal ingredients.",
                "chef": "Chef Marco Rossi",
            }),
        ),
        RestaurantConfig(
            key="booking_settings",
            value=json.dumps({
                "slot_duration_minutes": 30,
                "first_slot": "17:00",
                "last_slot": "21:00",
                "max_party_size": 10,
            }),
        ),
    ]
    db.add_all(configs)

    await db.commit()
    print("Database seeded successfully!")
