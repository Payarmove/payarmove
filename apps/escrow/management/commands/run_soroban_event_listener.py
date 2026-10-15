import time
import logging
from django.core.management.base import BaseCommand
from apps.escrow.soroban_client import SorobanClient
from apps.escrow.models import SmartContractEscrow

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Runs background event listener polling Soroban RPC for contract state changes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Soroban Event Listener Worker..."))
        client = SorobanClient()

        while True:
            try:
                # Query active escrows in CREATED state and check if funded on chain
                pending_escrows = SmartContractEscrow.objects.filter(
                    status=SmartContractEscrow.OnChainStatus.CREATED
                )
                for escrow in pending_escrows:
                    if escrow.deposit_tx_hash:
                        is_ok = client.verify_deposit_tx(
                            escrow.deposit_tx_hash,
                            escrow.total_locked_usdc,
                            escrow.agreement_symbol
                        )
                        if is_ok:
                            escrow.status = SmartContractEscrow.OnChainStatus.FUNDED
                            escrow.save()
                            self.stdout.write(self.style.SUCCESS(f"Updated escrow {escrow.agreement_symbol} to FUNDED"))

                time.sleep(5)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("Stopping event listener worker."))
                break
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error in listener loop: {e}"))
                time.sleep(5)
