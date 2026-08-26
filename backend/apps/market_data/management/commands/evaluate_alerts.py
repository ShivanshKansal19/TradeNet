from django.core.management.base import BaseCommand
from tasks.alert_evaluator import evaluate_all_alerts

class Command(BaseCommand):
    help = "Evaluate active user alerts against latest market and technical data."

    def handle(self, *args, **options):
        self.stdout.write("Evaluating active alerts...")
        res = evaluate_all_alerts()
        self.stdout.write(self.style.SUCCESS(str(res)))
