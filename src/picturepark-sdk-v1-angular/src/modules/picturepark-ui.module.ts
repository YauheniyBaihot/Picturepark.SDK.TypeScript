import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { ShareCardComponent } from '../components/share-card/share-card.component';
import { ChannelPickerComponent } from '../components/channel-picker/channel-picker.component';
import { ContentBrowserComponent } from '../components/content-browser/content-browser.component';
import { SearchBoxComponent } from '../components/search-box/search-box.component';
import { AggregationFilterComponent } from '../components/aggregation-filter/aggregation-filter.component';
import { ContentBrowserItemComponent } from '../components/content-browser-item/content-browser-item.component';
import { TranslatePipe } from '../pipes/translate.pipe';

// IMPORTANT: Update docs/picturepark-sdk-v1-angular/modules.md when changing modules

@NgModule({
  declarations: [
    ShareCardComponent,
    ChannelPickerComponent,
    ContentBrowserComponent,
    SearchBoxComponent,
    AggregationFilterComponent,
    ContentBrowserItemComponent,
    TranslatePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,

    VirtualScrollModule
  ],
  exports: [
    ShareCardComponent,
    ChannelPickerComponent,
    ContentBrowserComponent,
    SearchBoxComponent,
    AggregationFilterComponent,

    TranslatePipe
  ]
})
export class PictureparkUiModule {

}
