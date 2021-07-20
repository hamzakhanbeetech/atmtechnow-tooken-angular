import { Component, OnInit} from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { IApiKeys } from '../../interfaces/interfaces';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { CustomMessageService } from '../../../../services/custom-message.service';


@Component({
  selector: 'app-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit {
  keys: Array<IApiKeys> = [];
  is_wht_lable: number = 0;
  copied: boolean;
  constructor(public commonService: CommonService, private settingsService: SettingsService,
    private confirmationService: ConfirmationService, private customMessageService: CustomMessageService) { }

  ngOnInit() {
    this.getApiKeys();
  }

  getApiKeys() {
    this.settingsService.getApiKeys()
      .subscribe(response => {
        this.keys = response.data;
        this.keys.forEach(item => {
          item['copied'] = false;
        })
      },error=>{
        console.log(error)
      })
  }

  generateNewKey() {
    // gaSend.send('v3_app_tookanapp_api_key', 'api_key_generate_key', 'api_key_generate_key');
    // showLoader();
    this.settingsService.generateApiKey()
      .subscribe(response => {
        this.getApiKeys();
        this.customMessageService.showMessage({
          detail: response.message,
          severity: "success",
        })
      }, error => {
        this.commonService.handleError(error)
      })
  }

  deleteApiKey(key: string, index: number) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this API Key?",
      accept: () => {
        this.settingsService.deleteApiKey(key)
          .subscribe(response => {
            this.keys.splice(index, 1);
            this.customMessageService.showMessage({
              detail: response.message,
              severity: "success",
            })
          }, error => {
            this.commonService.handleError(error.error)
          })
      }
    })
  }
  /**
   * copy text to clipboard.
   * @param e click event
   * @param text text to be copied to clipboard
   */
  copyToClipboard(text: string) {
    // let text = text;
    var textarea;
    // In order to execute the "Copy" command, we actually have to have
    // a "selection" in the currently rendered document. As such, we're
    // going to inject a Textarea element and .select() it in order to
    // force a selection.
    // --
    // NOTE: This Textarea is being rendered off-screen.
    textarea = document.createElement("textarea");
    textarea.style.height = "0px";
    textarea.style.left = "-100px";
    textarea.style.opacity = "0";
    textarea.style.position = "fixed";
    textarea.style.top = "-100px";
    textarea.style.width = "0px";
    document.body.appendChild(textarea);
    textarea.className = "copyTextArea";

    // Set and select the value (creating an active Selection range).
    textarea.value = text;
    textarea.select();

    // Ask the browser to copy the current selection to the clipboard.
    document.execCommand("copy");
  }

  /**
   * To enable action menu on click
   * @param event 
   */
  showActionMenu(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.nextElementSibling.matches('.menu-list')) {
      el.nextElementSibling.setAttribute('display', 'block');
    }
  }

  onCopyClicked(text: string, item?) {
    this.copyToClipboard(text);
    if (item) {
      item.copied = true;
      //copyBtn.innerHTML = "Copied"
      setTimeout(() => {
        item.copied = false;
        //copyBtn.innerHTML = "Copy"
      }, 1500)
    }
    else {
      this.copied = true;
      //copyBtn.innerHTML = "Copied"
      setTimeout(() => {
        this.copied = false;
        //copyBtn.innerHTML = "Copy"
      }, 1500)
    }
  }
}
