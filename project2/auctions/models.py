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

# auction item and auction listings might be redundant

class Comments(models.Model):
    content = models.CharField(max_length=1000)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comment"
    )
    deleted = models.BooleanField

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

    comments = models.ForeignKey(
        Comments, on_delete=models.CASCADE, related_name="listings"
    )
    
    # related to bids
    date_of_bid_closure = models.DateField()

    
    def __str__(self):
        return self.name

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


class Item_Picture(models.Model):
    image = models.ImageField()
    item = models.ForeignKey(
        Auction_Item, on_delete=models.CASCADE, related_name="pictures"
    )


class Watchlist(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="watchlist"
    )
    items = models.ManyToManyField(
        Auction_Item, related_name='watchlist', blank=True
    )
    def __str__ (self):
        return f"{self.user}'s watchlist"


