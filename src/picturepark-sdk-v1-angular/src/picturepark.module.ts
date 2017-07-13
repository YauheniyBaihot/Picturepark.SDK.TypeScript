import { OpaqueToken } from "@angular/core";
import { NgModule, Inject, Optional } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AuthModule, OidcSecurityService, OpenIDImplicitFlowConfiguration } from 'angular-auth-oidc-client';

import { PictureparkConfiguration } from './picturepark.config';
import { PICTUREPARK_CONFIGURATION } from './picturepark.servicebase';
import {
  JsonSchemaService,
  ContentService,
  BusinessProcessService,
  DocumentHistoryService,
  SchemaService,
  UserService,
  PermissionService,
  PublicAccessService,
  ShareService,
  TransferService,
  AuthService
} from './picturepark.services';

@NgModule({
  imports: [
    HttpModule
  ],
  providers: [
    JsonSchemaService,
    ContentService,
    BusinessProcessService,
    DocumentHistoryService,
    SchemaService,
    UserService,
    PermissionService,
    PublicAccessService,
    ShareService,
    TransferService,
    AuthService]
})
export class PictureparkModule {
}

@NgModule({
  imports: [
    HttpModule,
    PictureparkModule,
    AuthModule.forRoot()
  ]
})
export class PictureparkOidcModule {
  constructor(
    @Inject(AuthService) authService: AuthService,
    @Inject(OidcSecurityService) oidcSecurityService: OidcSecurityService,
    @Inject(PICTUREPARK_CONFIGURATION) pictureparkConfiguration: PictureparkConfiguration) {

    let redirectRoute = "/pcpToken";
    let configuration = new OpenIDImplicitFlowConfiguration();
    configuration.client_id = 'picturepark_frontend';
    configuration.response_type = 'id_token token';
    configuration.scope = 'offline_access profile picturepark_api picturepark_account openid';

    configuration.stsServer = pictureparkConfiguration.stsServer;
    configuration.redirect_url = window.location.origin + redirectRoute + '/Success';
    configuration.post_logout_redirect_uri = window.location.origin + redirectRoute + '/Logout';
    configuration.startup_route = redirectRoute + '/Success';
    configuration.forbidden_route = redirectRoute + '/Forbidden';
    configuration.unauthorized_route = redirectRoute + '/Unauthorized';

    configuration.log_console_warning_active = true;
    configuration.log_console_debug_active = false;
    configuration.max_id_token_iat_offset_allowed_in_seconds = 10;
    configuration.override_well_known_configuration = false;
    configuration.storage = localStorage;

    console.log("OidcSecurityService configuration:");
    console.log(configuration);
    debugger;

    oidcSecurityService.setupModule(configuration);

    if (typeof location !== "undefined" && window.location.hash && window.location.hash.startsWith("#id_token=")) {
      authService.processAuthorizationRedirect();
    }
  }
}