
import { HttpInterceptor, HttpRequest } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(private commonService: CommonService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const newReq = req.clone({
      headers: req.headers.set(
        'accept-language', this.commonService.loginData ? this.commonService.loginData.language||'en' : 'en'
      )
    });
    return next.handle(newReq);
  }
}
