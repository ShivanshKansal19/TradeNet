# my_app/templatetags/my_filters.py
from django import template
from baseapp import utils

register = template.Library()


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)


@register.filter
def humanize(input):
    return utils.format_value(input)


@register.filter
def format_percentage(input):
    return utils.format_percentage(input)
