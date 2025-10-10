from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Item_Category(models.Model):
    category = models.CharField(max_length=32, unique=True)
    def __str__(self):
        return self.category

class Item_Condition(models.Model):
    condition = models.CharField(max_length=10, unique=True)
    def __str__(self):
        return self.condition


class Auction_Item(models.Model):
    # item details
    name = models.CharField(max_length=64)
    price = models.FloatField()
    category = models.ForeignKey(
        Item_Category, on_delete=models.CASCADE, related_name="items" 
    )
    condition = models.ForeignKey(
        Item_Condition, on_delete=models.CASCADE, related_name="items"
    )
    description = models.CharField(max_length=1000)
    # other details
    date_of_upload = models.DateField()
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="items"
    )
    def __str__(self):
        return self.name

class Item_Picture(models.Model):
    image = models.ImageField()
    item = models.ForeignKey(
        Auction_Item, on_delete=models.CASCADE, related_name="pictures"
    )

class Bids(models.Model):
    price = models.FloatField()
    item = models.ForeignKey(
        Auction_Item, on_delete=models.CASCADE, related_name="bids"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bids", default=None
    )
    def __str__(self):
        return f"price: {self.price}, item: {self.item}, user: {self.user}"
