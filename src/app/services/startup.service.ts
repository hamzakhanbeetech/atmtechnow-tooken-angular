import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
declare var ga:any;
@Injectable()
export class StartupService {

  constructor(private http: HttpClient, private commonService: CommonService) { }
  /** This is the method you want to call at bootstrap
  * Important: It should return a Promise
  * 48072.512b3480b4440b151c152c381d1623451bedc6fc29 b90f2177c1b70725d59c655b75998a3a 013036c1b608541c1c152c3c15152d4019e4c4f32f 30406.163626d7f3180b011c152f3c111524471de0c2fe2e
  */
 //152037d1ba1151141c152c301d19204719e7c0fc2f 5a6b2084ad1651111c152f3e1615224f1de3cdff2c
 //063d32c2f6165c071c152c311019274715edc0ff2d
//  1.08366882b2170d181c152d3f1d1420451ce1c0fa2d 
  public load(): Promise<any> {
    let obj: any = this.commonService.getCookie('obj');
    obj = obj ? JSON.parse(decodeURIComponent(obj)) : (!environment.production ? { accesstoken: '1.08366882b2170d181c152d3f1d1420451ce1c0fa2d ' } : ""); //admin
    // obj = obj ? JSON.parse(decodeURIComponent(obj)) : (!environment.production ? { accesstoken: '073766d3af044d461c152a3a141020471be0c0f22a' } : ""); // merchant
    // obj = obj ? JSON.parse(decodeURIComponent(obj)) : (!environment.production ? { accesstoken: '1a6420c7b71d080a1c152a38171620431be0c1f22f' } : ""); // manager
    if (obj) {
      return this.commonService.loginViaAccessToken(obj.accesstoken)
        .toPromise()
        .then((data: any) => {
          this.commonService.loginData = data.data;
          this.commonService.modifyDateTimeFormat()
          var date:any =new Date();
          ( (i, s, o, g, r, a, m)=> {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
              (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * date;
            a = s.createElement(o),
              m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
          })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
      
          ga('create',( data.data.reseller && data.data.reseller.google_analytics_id) ? data.data.reseller.google_analytics_id : 'UA-93509735-2', 'auto');
          ga('send', 'pageview');
        })
        .catch((err: any) => Promise.resolve());
    }
    else {
      Promise.reject('error');
    }
  }
 
}
