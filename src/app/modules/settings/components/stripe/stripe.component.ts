import { Component, OnInit, NgZone } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';

@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss', '../developers/developers.component.scss']
})
export class StripeComponent implements OnInit {
  stripeForm: FormGroup;
  addedCard;
  editMode: boolean = false
  constructor(private ngZone: NgZone, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService, ) { }

  ngOnInit() {
    this.initStripe();
    this.initStripeForm();
    this.formatCardNumber();
    this.getMerchantCards();

  }
  formatCardNumber() {
    this.stripeForm.get('cardNumber').valueChanges.subscribe((number) => {
      if (number.length > 16) {
        this.stripeForm.get('cardNumber').setValue(number.slice(0, 16));
      }
    });
    this.stripeForm.get('cvv').valueChanges.subscribe((number) => {
      if (number.length > 4) {
        this.stripeForm.get('cvv').setValue(number.slice(0, 4));
      }
    });
  }
  initStripe() {
    if (!(<any>window).Stripe) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://js.stripe.com/v2/';
      script.onload = () => {
        let stripeKey = environment.stripeKey;
        (<any>window).Stripe.setPublishableKey(stripeKey);
      };
      document.head.appendChild(script);
    }
  }

  initStripeForm() {
    this.stripeForm = this.formBuilder.group({
      'cardNumber': ['', [Validators.required, Validators.pattern(/^[0-9]{15,16}$/), Validators.maxLength(16)]],
      'expMonth': [1, [Validators.required]],
      'expYear': [2020, [Validators.required]],
      'cvv': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^[0-9]{3,4}$/)]],
      'name': ['', [Validators.required, Validators.pattern(/^[^\s].+[^\s]$/)]]
    });
  }
  fillStripeForm() {
    this.stripeForm.setValue({
      'cardNumber': `************${this.addedCard.last4_digits}`,
      'expMonth': this.addedCard.expiry_date.split('/')[0],
      'expYear': this.addedCard.expiry_date.split('/')[1],
      'cvv': '***',
      'name': this.addedCard.name
    })
  }
  getMerchantCards() {
    this.commonService.showLoader = true;
    this.settingsService.getMerchantCards().subscribe(
      response => {
        this.commonService.showLoader = false;
        if (response.data && response.data.length != 0) {
          this.addedCard = response.data[0];
          this.editMode = true;
          this.initStripeForm();
          setTimeout(() => {
            this.stripeForm.get('expMonth').disable();
            this.stripeForm.get('expYear').disable();
            this.fillStripeForm();
          })
        }
        else {
          this.editMode = false;
          this.initStripeForm();
          setTimeout(() => {
            this.stripeForm.get('expMonth').enable();
            this.stripeForm.get('expYear').enable();
          })
          this.formatCardNumber();
        }
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }
  addCard() {
    if (!this.stripeForm.valid) {
      return this.commonService.validateAllFormFields(this.stripeForm);
    } else {

      (<any>window).Stripe.createToken({
        number: this.stripeForm.get('cardNumber').value,
        cvc: this.stripeForm.get('cvv').value,
        exp_month: this.stripeForm.get('expMonth').value,
        exp_year: this.stripeForm.get('expYear').value,
      }, (status, response) => {

        this.ngZone.run(() => {
          if (response.error) {
            this.customMessage.showMessage({ summary: 'error', detail: response.error.message, severity: 'error' });
            this.commonService.showLoader = false;
            return;
          }
          else {
            this.commonService.showLoader = true;
            this.settingsService.addMerchantCard(response, this.stripeForm.get('name').value).subscribe(
              response => {
                this.commonService.showLoader = false;
                this.getMerchantCards();
                this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
              },
              error => {
                this.commonService.showLoader = false;
                this.commonService.handleError(error);
              });
          }
        });
      });
    }
  }
  deleteCard() {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Card  ?",
      accept: () => {
        this.commonService.showLoader = true;
        this.settingsService.deleteCard().subscribe(
          response => {
            this.commonService.showLoader = false;
            this.getMerchantCards();
          },
          error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          });
      }
    });
  }
}
