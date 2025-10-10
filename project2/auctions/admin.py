from django.contrib import admin
from .models import User, Item_Category, Item_Condition, Auction_Item, Item_Picture

# Register your models here.

class Item_CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "category")

class Item_ConditionAdmin(admin.ModelAdmin):
    list_display = ("id", "condition")

class Auction_ItemAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "category", "condition", "description", "date_of_upload", "user")


admin.site.register(User)
admin.site.register(Item_Category, Item_CategoryAdmin)
admin.site.register(Item_Condition, Item_ConditionAdmin)
admin.site.register(Auction_Item, Auction_ItemAdmin)
admin.site.register(Item_Picture)