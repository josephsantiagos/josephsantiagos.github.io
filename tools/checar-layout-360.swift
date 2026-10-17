// Confere a largura de 360 px (sem rolagem horizontal) num WebKit fora da tela e salva prints.
// Uso (com o site servido em 127.0.0.1:8811):
//   mkdir -p /tmp/prints && swift tools/checar-layout-360.swift /tmp/prints 360 http://127.0.0.1:8811/simulador-emprestimo/
// Saída por página: sw (scrollWidth) deve ser igual a cw (clientWidth) e "off" deve vir vazio.
import Cocoa
import WebKit

// Renderiza páginas num WKWebView fora da tela com largura fixa, mede rolagem horizontal
// e salva um print da página inteira. Uso: swift snap.swift <saida> <largura> <url>...
final class Runner: NSObject, WKNavigationDelegate {
    let urls: [String]
    var idx = 0
    let web: WKWebView
    let outDir: String
    let width: CGFloat

    init(urls: [String], outDir: String, width: CGFloat) {
        self.urls = urls
        self.outDir = outDir
        self.width = width
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: 740), configuration: WKWebViewConfiguration())
        super.init()
        web.navigationDelegate = self
    }

    func next() {
        if idx >= urls.count { NSApp.terminate(nil); return }
        web.frame = NSRect(x: 0, y: 0, width: width, height: 740)
        web.load(URLRequest(url: URL(string: urls[idx])!))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            let js = """
            (function(){
              var de=document.documentElement, off=[];
              document.querySelectorAll('body *').forEach(function(e){
                var r=e.getBoundingClientRect(); if(r.width===0) return;
                if(r.right>de.clientWidth+0.5){
                  var p=e.parentElement, dentro=false;
                  while(p){ if(p.classList&&p.classList.contains('rolagem')){dentro=true;break;} p=p.parentElement; }
                  if(!dentro) off.push(e.tagName+'.'+e.className+'@'+Math.round(r.right));
                }
              });
              var res=document.querySelector('.resultado');
              var calc=document.querySelector('.calc');
              return JSON.stringify({sw:de.scrollWidth, cw:de.clientWidth, h:de.scrollHeight,
                calcTop: calc?Math.round(calc.getBoundingClientRect().top):null,
                off:off.slice(0,6), res: res? res.innerText.replace(/\\s+/g,' ').slice(0,90):''});
            })()
            """
            webView.evaluateJavaScript(js) { result, err in
                let s = (result as? String) ?? "erro \(String(describing: err))"
                print(self.urls[self.idx] + "  " + s)
                var h: CGFloat = 2000
                if let d = s.data(using: .utf8),
                   let obj = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                   let hh = obj["h"] as? Double { h = CGFloat(min(hh, 9000)) }
                webView.frame = NSRect(x: 0, y: 0, width: self.width, height: h)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    let cfg = WKSnapshotConfiguration()
                    cfg.rect = NSRect(x: 0, y: 0, width: self.width, height: h)
                    webView.takeSnapshot(with: cfg) { img, _ in
                        if let img = img, let tiff = img.tiffRepresentation,
                           let rep = NSBitmapImageRep(data: tiff),
                           let png = rep.representation(using: .png, properties: [:]) {
                            try? png.write(to: URL(fileURLWithPath: "\(self.outDir)/shot-\(self.idx).png"))
                        }
                        self.idx += 1
                        self.next()
                    }
                }
            }
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("falhou: \(urls[idx]) \(error)"); idx += 1; next()
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("falhou: \(urls[idx]) \(error)"); idx += 1; next()
    }
}

let args = CommandLine.arguments
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let runner = Runner(urls: Array(args.dropFirst(3)), outDir: args[1], width: CGFloat(Double(args[2])!))
let win = NSWindow(contentRect: NSRect(x: -20000, y: -20000, width: 400, height: 740), styleMask: [.borderless], backing: .buffered, defer: false)
let holder = NSView(frame: NSRect(x: 0, y: 0, width: 400, height: 740))
win.contentView = holder
holder.addSubview(runner.web)
Timer.scheduledTimer(withTimeInterval: 120, repeats: false) { _ in print("timeout"); NSApp.terminate(nil) }
runner.next()
app.run()
