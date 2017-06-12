import { Injectable, Inject, Optional, OpaqueToken } from '@angular/core'; // ignore
import { Observable } from 'rxjs/Observable'; // ignore
import { Http, Headers } from '@angular/http'; // ignore
import { PICTUREPARK_URL } from "./picturepark.services"; // ignore

import { Output, EventEmitter } from '@angular/core';
import { PictureparkServiceBase, PICTUREPARK_REFRESH_TOKEN } from './picturepark.servicebase';
import * as generated from "./picturepark.services";

class TranslatedStringDictionary extends generated.TranslatedStringDictionary {
    translate(locale: string) {
        let language = locale.split("-")[0];
        return this[language] ? this[language] : this[Object.keys(this)[0]];
    }
}

class FilterBase extends generated.FilterBase {
    getDisplayName(locale: string): string | null {
        return null;
    }    
}

class DateRangeFilter extends generated.DateRangeFilter {
    getDisplayName(locale: string) {
        return this.range && this.range.names ? this.range.names.translate(locale) : "n/a";
    }
}

class AggregationResultItem extends generated.AggregationResultItem {
    getDisplayName(locale: string) {
      let displayName = this.filter && this.filter.filter ? this.filter.filter.getDisplayName(locale) : null; 
      return displayName ? displayName : this.name;
    }
}

class ContentService extends generated.ContentService {
    private thumbnailCache: { [key: string]: Blob | null; } = {};

    /**
     * Get Thumbnail
     * @contentId The Content id
     * @size Thumbnail size. Either small, medium or large
     * @return HttpResponseMessage
     */
    downloadThumbnail(contentId: string, size: generated.ThumbnailSize, cache?: boolean): Observable<Blob> {
        let key = contentId + ":" + size;
        if (cache !== false && this.thumbnailCache[key] !== undefined)
            return Observable.of(this.thumbnailCache[key]);

        let response = this.downloadThumbnailCore(contentId, size);
        response.subscribe(blob => {
            this.thumbnailCache[key] = blob;
        });
        return response;
    }
}

@Injectable()
export class AuthService {
    private http: Http; 
    private baseUrl: string; 

    private _username: string | null; 
    private _token: string | null = null; 
    private _refreshToken: string | null = null; 
    private _saveCredentials = false;

    constructor(@Inject(Http) http: Http, @Optional() @Inject(PICTUREPARK_URL) baseUrl?: string, @Optional() @Inject(PICTUREPARK_REFRESH_TOKEN) refreshToken?: boolean) {
        this.http = http; 
        this.baseUrl = baseUrl ? baseUrl : ""; 

        this.loadCredentials();
        if (refreshToken !== false)
            setInterval(() => this.updateToken(), 10 * 60 * 1000);
    }

    get isLoggedIn() { 
        return this._refreshToken !== null; 
    }
        
    @Output()
    isLoggedInChange = new EventEmitter();

    get username() {
        return this._username; 
    }

    get token() {
        return this._token;
    }

    login(username: string, password: string, saveCredentials?: boolean): Promise<void> {
        let url = this.baseUrl + "/token";
        let content = "grant_type=password&username=" + username + "&password=" + password + "&client_id=Picturepark.Application";

        return this.http.post(url, content, {
            headers: new Headers({
                "Content-Type": "application/x-www-form-urlencoded"
            })
        }).map((response) => {
            var result = response.json();            
            this._username = username; 
            this._token = "Bearer " + result.access_token;
            this._refreshToken = result.refresh_token;      
            this._saveCredentials = saveCredentials === undefined || saveCredentials === true;  
            this.isLoggedInChange.emit(this.isLoggedIn); 

            this.saveCredentials();
        }).toPromise();
    }

    logout(): Promise<void> {
        this._username = null; 
        this._token = null; 
        this._refreshToken = null; 
        this.isLoggedInChange.emit(this.isLoggedIn); 
        
        this.clearStoredCredentials();
        return Promise.resolve(); 
    }

    updateTokenIfRequired() {
        if (this._refreshToken !== null && this._token == null)
            return this.updateToken();
        else
           return Promise.resolve();
    }
    
    clearStoredCredentials() {
        if (localStorage && sessionStorage) {
            localStorage.setItem("picturepark_username", JSON.stringify(null));
            localStorage.setItem("picturepark_refreshToken", JSON.stringify(null));
            sessionStorage.setItem("picturepark_username", JSON.stringify(null));
            sessionStorage.setItem("picturepark_refreshToken", JSON.stringify(null));
        }
    }

    private updateToken() {       
        if (this._refreshToken !== null){
            let url = this.baseUrl + "/token";
            let content = "grant_type=refresh_token&refresh_token=" + this._refreshToken + "&client_id=Picturepark.Application";

            return this.http.post(url, content, {
                headers: new Headers({
                    "Content-Type": "application/x-www-form-urlencoded"
                })
            }).map((response) => {
                var result = response.json();

                this._token = "Bearer " + result.access_token; 
                this._refreshToken = result.refresh_token; 

                this.saveCredentials();
            }).toPromise().catch(() => {
                this.logout();
            });
       } else
           return Promise.resolve();
    }

    private loadCredentials() {
        if (localStorage && sessionStorage) {
            this._username = <string>JSON.parse(localStorage.getItem("picturepark_username")!);
            this._refreshToken = <string>JSON.parse(localStorage.getItem("picturepark_refreshToken")!);
            this._saveCredentials = this._refreshToken !== null;

            if (!this._username) {
                this._username = <string>JSON.parse(sessionStorage.getItem("picturepark_username")!);
                this._refreshToken = <string>JSON.parse(sessionStorage.getItem("picturepark_refreshToken")!);
            }
        }
    }

    private saveCredentials() {
        if (localStorage && sessionStorage) {
            if (this._saveCredentials) {
                localStorage.setItem("picturepark_username", JSON.stringify(this._username));
                localStorage.setItem("picturepark_refreshToken", JSON.stringify(this._refreshToken));
            } else {
                sessionStorage.setItem("picturepark_username", JSON.stringify(this._username));
                sessionStorage.setItem("picturepark_refreshToken", JSON.stringify(this._refreshToken));
            }
        }
    }
}