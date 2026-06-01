from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=list[schemas.PageContent])
async def get_pages(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all pages.
    """
    pages = await crud.page.get_multi(db, skip=skip, limit=limit)
    return pages

STATIC_UI_TRANSLATIONS = {
    "uz": {
        "about_company": "Kompaniya haqida",
        "blog": "Blog",
        "delivery_payment": "Yetkazib berish va to'lov",
        "warranty_return": "Kafolat va qaytarish",
        "installment": "Muddatli to'lov",
        "3d_visualizer": "3D Vizualizator",
        "catalog": "Katalog",
        "showrooms": "Showroomlar",
        "partners": "Hamkorlarga",
        "architects": "Arxitektorlarga",
        "designers": "Dizaynerlarga",
        "developers": "Quruvchilarga",
        "wholesalers": "Ulgurji xaridorlarga",
        "faq_qa": "Ko'p beriladigan savollar",
        "outlet": "Outlet",
        "certificates": "Sertifikatlar",
        "search_placeholder": "Mahsulotlarni qidirish...",
        "all_categories": "Barcha kategoriyalar",
        "brands": "Brendlar",
        "characteristics": "Xususiyatlari",
        "sections": "Bo'limlar",
        "contacts": "Kontaktlar",
        "our_address": "Bizning manzilimiz",
        "phone": "Telefon",
        "copyright": "© 2026 Maff.uz. Barcha huquqlar himoyalangan.",
        "site_development": "Saytni ishlab chiqish",
        "cart": "Savat",
        "favorites": "Saralanganlar",
        "compare": "Taqqoslash",
        "back_to_main": "Bosh sahifaga",
        "buy_now": "Hozir xarid qilish",
        "add_to_cart": "Savatga qo'shish",
        "added_to_cart": "Qo'shildi",
        "empty_cart": "Savatingiz bo'sh",
        "checkout": "Buyurtmani rasmiylashtirish",
        "full_name": "F.I.Sh.",
        "phone_number": "Telefon raqami",
        "send_request": "Sorov yuborish",
        "request_success": "Arizangiz muvaffaqiyatli yuborildi!",
        "categories_capital": "Kategoriyalar",
        "back_to_catalog": "Katalogga qaytish",
        "main_page": "Bosh sahifa",
        "view_all": "Barchasini ko'rish",
        "not_found": "Topilmadi",
        "brand_label": "Brend",
        "country_label": "Mamlakat",
        "thickness_label": "Qalinligi",
        "grade_label": "Sinf",
        "sku_label": "Artikul",
        "unit_label": "O'lchov birligi",
        "stock_label": "Mavjudligi",
        "similar_products": "O'xshash mahsulotlar",
        "accessories": "Butlovchi qismlar",
        "in_stock": "Mavjud",
        "out_of_stock": "Mavjud emas",
        "under_order": "Buyurtma asosida",
        "order_btn": "Buyurtma berish",
        "compare_btn": "Taqqoslash",
        "no_photo": "Rasm yo'q",
        "currency_sum": "so'm",
        "recommended_title": "Tavsiya etamiz",
        "expert_choice": "Mutaxassislarimizning eng yaxshi tanlovi",
        "our_brands": "Bizning brendlar",
        "categories_title": "Kategoriyalar",
        "show_all": "Barchasini ko'rish",
        "go_to_selection": "Tanlashga o'tish",
        "view_products": "Mahsulotlarni ko'rish",
        "no_products_yet": "Ushbu kategoriyada hali mahsulotlar yo'q",
        "new_arrivals_soon": "Tez orada yangi mahsulotlar qo'shamiz",
        "back_btn": "Orqaga qaytish",
        "sort_by_name": "Nomi bo'yicha",
        "sort_by_price_asc": "Narxi (arzon)",
        "sort_by_price_desc": "Narxi (qimmat)",
        "popular": "Ommabop",
        "new_items": "Yangi mahsulotlar",
        "europe": "Evropa",
        "standard": "Standart",
        "filters": "Filtrlar",
        "reset_filters": "Filtrlarni tozalash",
        "shown": "Ko'rsatildi",
        "from_total": "dan",
        "sorting": "Saralash",
        "quick_view": "Tezkor ko'rish",
        "description_label": "Tavsif",
    },
    "en": {
        "about_company": "About Us",
        "blog": "Blog",
        "delivery_payment": "Delivery & Payment",
        "warranty_return": "Warranty & Returns",
        "installment": "Installment",
        "3d_visualizer": "3D Visualizer",
        "catalog": "Catalog",
        "showrooms": "Showrooms",
        "partners": "For Partners",
        "architects": "For Architects",
        "designers": "For Designers",
        "developers": "For Developers",
        "wholesalers": "For Wholesalers",
        "faq_qa": "FAQ",
        "outlet": "Outlet",
        "certificates": "Certificates",
        "search_placeholder": "Search products...",
        "all_categories": "All Categories",
        "brands": "Brands",
        "characteristics": "Specifications",
        "sections": "Sections",
        "contacts": "Contacts",
        "our_address": "Our Address",
        "phone": "Phone",
        "copyright": "© 2026 Maff.uz. All rights reserved.",
        "site_development": "Website Development",
        "cart": "Cart",
        "favorites": "Favorites",
        "compare": "Compare",
        "back_to_main": "To Main Page",
        "buy_now": "Buy Now",
        "add_to_cart": "Add to Cart",
        "added_to_cart": "Added",
        "empty_cart": "Your cart is empty",
        "checkout": "Checkout",
        "full_name": "Full Name",
        "phone_number": "Phone Number",
        "send_request": "Submit Request",
        "request_success": "Request successfully submitted!",
        "categories_capital": "Categories",
        "back_to_catalog": "Back to Catalog",
        "main_page": "Home",
        "view_all": "View All",
        "not_found": "Not Found",
        "brand_label": "Brand",
        "country_label": "Country",
        "thickness_label": "Thickness",
        "grade_label": "Class",
        "sku_label": "SKU",
        "unit_label": "Unit",
        "stock_label": "Availability",
        "similar_products": "Similar Products",
        "accessories": "Accessories",
        "in_stock": "In stock",
        "out_of_stock": "Out of stock",
        "under_order": "Under order",
        "order_btn": "Order",
        "compare_btn": "Compare",
        "no_photo": "No photo",
        "currency_sum": "so'm",
        "recommended_title": "Recommended",
        "expert_choice": "Best choice of our experts",
        "our_brands": "Our Brands",
        "categories_title": "Categories",
        "show_all": "View All",
        "go_to_selection": "Go to selection",
        "view_products": "View products",
        "no_products_yet": "No products in this category yet",
        "new_arrivals_soon": "we will add new arrivals soon",
        "back_btn": "Go back",
        "sort_by_name": "By name",
        "sort_by_price_asc": "Price (cheap first)",
        "sort_by_price_desc": "Price (expensive first)",
        "popular": "Popular",
        "new_items": "New items",
        "europe": "Europe",
        "standard": "Standard",
        "filters": "Filters",
        "reset_filters": "Reset filters",
        "shown": "Shown",
        "from_total": "of",
        "sorting": "Sorting",
        "quick_view": "Quick view",
        "description_label": "Description",
    }
}

@router.get("/translations/items")
async def get_ui_translations(
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get all static UI translations.
    """
    from app.services.translation import get_locale_from_request, get_translations_bulk
    from app.core.config import settings
    
    lang = get_locale_from_request(request)
    
    DEFAULT_UI_TRANSLATIONS = {
        "about_company": "О компании",
        "blog": "Блог",
        "delivery_payment": "Доставка и оплата",
        "warranty_return": "Гарантия и возврат",
        "installment": "Рассрочка",
        "3d_visualizer": "3D Визуализатор",
        "catalog": "Каталог",
        "showrooms": "Шоурумы",
        "partners": "Партнерам",
        "architects": "Архитекторам",
        "designers": "Дизайнерам",
        "developers": "Застройщикам",
        "wholesalers": "Оптовикам",
        "faq_qa": "Вопросы и ответы",
        "outlet": "Аутлет",
        "certificates": "Сертификаты",
        "search_placeholder": "Поиск товаров...",
        "all_categories": "Все категории",
        "brands": "Бренды",
        "characteristics": "Характеристики",
        "sections": "Разделы",
        "contacts": "Контакты",
        "our_address": "Наш адрес",
        "phone": "Телефон",
        "copyright": "© 2026 Maff.uz. Все права защищены.",
        "site_development": "Разработка сайта",
        "cart": "Корзина",
        "favorites": "Избранное",
        "compare": "Сравнение",
        "back_to_main": "На главную",
        "buy_now": "Купить сейчас",
        "add_to_cart": "В корзину",
        "added_to_cart": "Добавлено",
        "empty_cart": "Ваша корзина пуста",
        "checkout": "Оформить заказ",
        "full_name": "ФИО",
        "phone_number": "Номер телефона",
        "send_request": "Отправить заявку",
        "request_success": "Заявка успешно отправлена!",
        "categories_capital": "Категории",
        "back_to_catalog": "Назад в каталог",
        "main_page": "Главная",
        "view_all": "Смотреть все",
        "not_found": "Не найдено",
        "brand_label": "Бренд",
        "country_label": "Страна",
        "thickness_label": "Толщина",
        "grade_label": "Класс",
        "sku_label": "Артикул",
        "unit_label": "Ед. изм.",
        "stock_label": "Наличие",
        "similar_products": "Похожие товары",
        "accessories": "Комплектующие",
        "in_stock": "В наличии",
        "out_of_stock": "Нет в наличии",
        "under_order": "Под заказ",
        "order_btn": "Заказать",
        "compare_btn": "Сравнить",
        "no_photo": "Нет фото",
        "currency_sum": "сум",
        "recommended_title": "Рекомендуем",
        "expert_choice": "Лучший выбор наших экспертов",
        "our_brands": "Наши бренды",
        "categories_title": "Категории",
        "show_all": "Смотреть всё",
        "go_to_selection": "Перейти к выбору",
        "view_products": "Смотреть товары",
        "no_products_yet": "В этой категории пока нет товаров",
        "new_arrivals_soon": "мы скоро добавим новые поступления",
        "back_btn": "Вернуться назад",
        "sort_by_name": "По названию",
        "sort_by_price_asc": "Сначала дешевые",
        "sort_by_price_desc": "Сначала дорогие",
        "popular": "Популярные",
        "new_items": "Новинки",
        "europe": "Европа",
        "standard": "Стандарт",
        "filters": "Фильтры",
        "reset_filters": "Сбросить фильтры",
        "shown": "Показано",
        "from_total": "из",
        "sorting": "Сортировка",
        "quick_view": "Быстрый просмотр",
        "description_label": "Описание",
    }
    
    if not lang or lang == "ru":
        return DEFAULT_UI_TRANSLATIONS
        
    # Check if we have pre-defined translations for this language
    if lang in STATIC_UI_TRANSLATIONS:
        return STATIC_UI_TRANSLATIONS[lang]
        
    items_list = [{"id": key, "text": val} for key, val in DEFAULT_UI_TRANSLATIONS.items()]
    
    await get_translations_bulk(db, "ui", items_list, ["text"], lang, settings.CLAUDE_API_KEY)
    
    translated_dict = {}
    for item in items_list:
        translated_dict[item["id"]] = item["text"]
        
    return translated_dict

@router.get("/{slug}", response_model=schemas.PageContent)
async def get_page_content(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get page content by slug.
    """
    page = await crud.page.get_by_slug(db, slug=slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page content not found")
        
    from app.services.translation import get_locale_from_request, translate_page_content
    from app.core.config import settings
    
    lang = get_locale_from_request(request)
    if lang and lang != "ru":
        translated_content = await translate_page_content(db, slug, page.content, lang, settings.CLAUDE_API_KEY)
        page.content = translated_content
        
    return page

@router.post("/", response_model=schemas.PageContent)
async def create_or_update_page_content(
    *,
    db: AsyncSession = Depends(deps.get_db),
    obj_in: schemas.PageContentCreate,
) -> Any:
    """
    Create or update page content.
    """
    page = await crud.page.create_or_update(db, obj_in=obj_in)
    return page
