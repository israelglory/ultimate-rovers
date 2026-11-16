/*
 * dc-preview.js
 * Minimal standalone renderer for the Ultimate Rovers design pages (.dc.html).
 * Supports: {{path}} holes, <sc-for list as>, <sc-if value>, onClick/onChange/onInput
 * handlers returned from renderVals(), setState, data-props defaults, and
 * ?prop=value URL overrides (for example MatchCentre.dc.html?status=Live).
 * Preview tooling only. Not part of the production build.
 */
(function () {
  'use strict';
  var inst = null;
  var body = '';
  var root = null;
  var handlers = [];
  var pending = false;

  function DCLogic(props) {
    this.props = props || {};
    this.state = null;
  }
  DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === 'function' ? patch(this.state || {}, this.props) : patch;
    this.state = Object.assign({}, this.state || {}, next);
    schedule();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };

  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () { pending = false; draw(); }, 0);
  }

  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var cur = scope;
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function esc(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function holes(str, scope) {
    str = str.replace(/\s(on[A-Z][a-zA-Z]*)="\{\{\s*([^}]+?)\s*\}\}"/g, function (m, ev, path) {
      var fn = lookup(path, scope);
      if (typeof fn !== 'function') return '';
      handlers.push(fn);
      return ' data-dc-' + ev.slice(2).toLowerCase() + '="' + (handlers.length - 1) + '"';
    });
    return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (m, path) {
      var v = lookup(path, scope);
      return v == null ? '' : esc(v);
    });
  }

  function attrOf(attrs, name) {
    var m = new RegExp('(?:^|\\s)' + name + '="([^"]*)"').exec(attrs);
    return m ? m[1] : null;
  }

  function render(src, scope) {
    var out = '';
    var i = 0;
    var open = /<(sc-for|sc-if)\b([^>]*)>/g;
    for (;;) {
      open.lastIndex = i;
      var m = open.exec(src);
      if (!m) { out += holes(src.slice(i), scope); break; }
      out += holes(src.slice(i, m.index), scope);
      var tag = m[1];
      var attrs = m[2];
      var start = open.lastIndex;
      var depth = 1;
      var tagRe = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'g');
      tagRe.lastIndex = start;
      var innerEnd = src.length;
      var after = src.length;
      var t;
      while ((t = tagRe.exec(src))) {
        if (t[1]) { depth--; if (depth === 0) { innerEnd = t.index; after = tagRe.lastIndex; break; } }
        else depth++;
      }
      var inner = src.slice(start, innerEnd);
      var val = function (name) {
        var raw = attrOf(attrs, name);
        if (raw == null) return undefined;
        var h = /^\{\{\s*([^}]+?)\s*\}\}$/.exec(raw.trim());
        return h ? lookup(h[1], scope) : raw;
      };
      if (tag === 'sc-if') {
        if (val('value')) out += render(inner, scope);
      } else {
        var list = val('list') || [];
        var as = attrOf(attrs, 'as') || 'item';
        for (var k = 0; k < list.length; k++) {
          var s = Object.create(scope);
          s[as] = list[k];
          s.$index = k;
          out += render(inner, s);
        }
      }
      i = after;
    }
    return out;
  }

  function draw() {
    handlers = [];
    var vals = inst.renderVals ? inst.renderVals() : {};
    var y = window.scrollY;
    root.innerHTML = render(body, vals || {});
    window.scrollTo(0, y);
  }

  function delegate(type) {
    root.addEventListener(type, function (e) {
      var el = e.target.closest('[data-dc-' + type + ']');
      if (!el) return;
      var fn = handlers[Number(el.getAttribute('data-dc-' + type))];
      if (fn) fn(e);
    });
  }

  function boot() {
    var tplEl = document.getElementById('dc-template');
    var codeEl = document.querySelector('script[type="text/x-dc"]');
    root = document.getElementById('dc-root');
    var src = tplEl.textContent;
    var helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(src);
    if (helmet) {
      document.head.insertAdjacentHTML('beforeend', helmet[1]);
      src = src.replace(helmet[0], '');
    }
    body = src;
    var spec = {};
    try { spec = JSON.parse(codeEl.getAttribute('data-props') || '{}'); } catch (err) { spec = {}; }
    var props = {};
    Object.keys(spec).forEach(function (k) {
      if (k.charAt(0) !== '$' && spec[k] && 'default' in spec[k]) props[k] = spec[k].default;
    });
    new URLSearchParams(location.search).forEach(function (v, k) { props[k] = v; });
    var Component = new Function('DCLogic', codeEl.textContent + '\n;return Component;')(DCLogic);
    inst = new Component(props);
    if (!inst.props || Object.keys(inst.props).length === 0) inst.props = props;
    ['click', 'change', 'input'].forEach(delegate);
    draw();
    if (typeof inst.componentDidMount === 'function') inst.componentDidMount();
  }

  window.DCLogic = DCLogic;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
