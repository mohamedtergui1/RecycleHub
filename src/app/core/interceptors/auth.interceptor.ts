import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { AuthService } from '../../pages/service/auth.service';
import { inject } from '@angular/core';
import { catchError, tap, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService: AuthService = inject(AuthService);
    console.log(req.url);
    const newReq = req.clone({
        url: environment.api + req.url,
        headers: req.headers.set('Authorization', authService.getToken() || '')
    });
    console.log(newReq.url);
    return next(newReq).pipe(
        tap((response: any) => {
            console.log(response);
        }),
        catchError((error: HttpErrorResponse) => {
            console.log(error);
            return throwError(() => error);
        }),
        finalize(() => {})
    );
};
