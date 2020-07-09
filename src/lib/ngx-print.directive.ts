import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: "button[ngxPrint]"
})
export class NgxPrintDirective
{

  /**
   *
   *
   * @member of NgxPrintDirective
   */
  @Input() printSectionId: string;
  /**
   *
   *
   * @member of NgxPrintDirective
   */
  @Input() printTitle: string;
  /**
   *
   *
   * @member of NgxPrintDirective
   */
  @Input() useExistingCss = false;
  /**
   * A delay in milliseconds to force the print dialog to wait before opened. Default: 0
   *
   * @member of NgxPrintDirective
   */
  @Input() printDelay: number = 0;

  public _printStyle = [];

  /**
   *
   *
   * @member of NgxPrintDirective
   */
  @Input()
  set printStyle(values: { [key: string]: { [key: string]: string } })
  {
    for (let key in values)
    {
      if (values.hasOwnProperty(key))
      {
        this._printStyle.push((key + JSON.stringify(values[key])).replace(/['"]+/g, ''));
      }
    }
    this.returnStyleValues();
  }

  /**
   *
   *
   * @returns html for the given tag
   *
   * @member of NgxPrintDirective
   */
  private _styleSheetFile = '';

  /**
   * @member of NgxPrintDirective
   * @param cssList
   */
  @Input()
  set styleSheetFile(cssList: string)
  {
    let linkTagFn = cssFileName =>
        `<link rel="stylesheet" type="text/css" href="${cssFileName}">`;
    if (cssList.indexOf(',') !== -1)
    {
      const valueArr = cssList.split(',');
      for (let val of valueArr)
      {
        this._styleSheetFile = this._styleSheetFile + linkTagFn(val);
      }
    }
    else
    {
      this._styleSheetFile = linkTagFn(cssList);
    }
  }

  /**
   *
   *
   * @returns the string that create the stylesheet which will be injected
   * later within <style></style> tag.
   *
   * -join/replace to transform an array objects to css-styled string
   *
   * @member of NgxPrintDirective
   */
  public returnStyleValues()
  {
    return `<style> ${this._printStyle.join(' ').replace(/,/g, ';')} </style>`;
  }

  /**
   *
   *
   * @member of NgxPrintDirective
   */
  @HostListener('click')
  public print(): void
  {
    let printContents, popupWin, styles = '', links = '';

    if (this.useExistingCss)
    {
      styles = NgxPrintDirective.getElementTag('style');
      links = NgxPrintDirective.getElementTag('link');
    }

    printContents = document.getElementById(this.printSectionId).innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=auto,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html lang="en-us">
        <head>
          <title>${this.printTitle ? this.printTitle : ""}</title>
          ${this.returnStyleValues()}
          ${this.returnStyleSheetLinkTags()}
          ${styles}
          ${links}
        </head>
        <body>
          ${printContents}
          <script defer>
            function triggerPrint(event) {
              window.removeEventListener('load', triggerPrint, false);
              setTimeout(() => {
                window.print();
                setTimeout(function() { window.close(); }, 0);
              }, ${this.printDelay});
            }
            window.addEventListener('load', triggerPrint, false);
          </script>
        </body>
      </html>`);
    popupWin.document.close();
  }

  /**
   * @returns string which contains the link tags containing the css which will
   * be injected later within <head></head> tag.
   *
   */
  private returnStyleSheetLinkTags()
  {
    return this._styleSheetFile;
  }

  private static getElementTag(tag: keyof HTMLElementTagNameMap): string
  {
    const html: string[] = [];
    const elements = document.getElementsByTagName(tag);
    for (let index = 0; index < elements.length; index++)
    {
      html.push(elements[index].outerHTML);
    }
    return html.join('\r\n');
  }
}
