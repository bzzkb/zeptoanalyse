/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {

  // 暂时没看
  /*基本配置开始*/
  var undefined, key, $, classList, emptyArray = [],
    // 数组的slice 函数 和 filter
    slice = emptyArray.slice,
    filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {},
    classCache = {},
    // 定义基本属性
    cssNumber = {
      'column-count': 1,
      'columns': 1,
      'font-weight': 1,
      'line-height': 1,
      'opacity': 1,
      'z-index': 1,
      'zoom': 1
    },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = ['after', 'prepend', 'before', 'append'],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table,
      'thead': table,
      'tfoot': table,
      'td': tableRow,
      'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
    function(object) {
      return object instanceof Array
    }
 
  /*基本配置结束*/

  // 节点是否匹配选择器
  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false

    // 用于检查某个元素node是否匹配选择器表达式
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
      element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
  
    // 如果不能用原生的进行判断
    var match, parent = element.parentNode,
      temp = !parent
    if (temp)(parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  /*各个工具函数*/

  //常用的Object.prototype.toString.call判定类型
  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }
  
  // 判定是否是函数
  function isFunction(value) {
    return type(value) == "function"
  }

  //判断是不是iframe 因为每一个ifame都有自己的window对象
  function isWindow(obj) {
    return obj != null && obj == obj.window
  }
   
  // 是不是doucment节点(documentElement不行) 一定返回9
  function isDocument(obj) {
    return obj != null && obj.nodeType == obj.DOCUMENT_NODE
  }

  //是不是对象
  function isObject(obj) {
    return type(obj) == "object"
  }

  //是不是字面量对象
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  //数组或者伪数组
  function likeArray(obj) {
    return typeof obj.length == 'number'
  }
   
  // 去空数组 filter返回true的项的数组
  function compact(array) {
    return filter.call(array, function(item) {
      return item != null
    })
  }

  //应该是对数组进行连接
  function flatten(array) {
    return array.length > 0 ? $.fn.concat.apply([], array) : array
  }

  //转换为驼峰命名，如果是驼峰就直接返回
  //replace的函数的两个参数(第一个是匹配的'-x' 第二个是x)
  camelize = function(str) {
    return str.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : ''
    })
  }
  
  //暂时不清楚
  function dasherize(str) {
    return str.replace(/::/g, '/')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/_/g, '-')
      .toLowerCase()
  }

  // 数组去重(技术点是这样的indexOf是返回查找到的第一个的位置)
  uniq = function(array) {
    return filter.call(array, function(item, idx) {
      return array.indexOf(item) == idx
    })
  }
  
  // 暂时不清楚
  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  // 暂时不清楚
  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }
  
  // 暂时不清楚
  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }
 
  // 暂时不清楚
  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node) {
        if (node.nodeType == 1) return node
      })
  }

  /*文档碎片插入节点*/
  //节点生成器
  zepto.fragment = function(html, name, properties) {

    var dom, nodes, container
    // 这个正则是验证<p></p>的
    // singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      // tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function() {
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }
  
  // 前面全是工具函数

  // 所有的东西最后都会经过这个函数 来达到 [xxx,xxx,xx,xx]的形式
  // 在这里对对象进行包装
  zepto.Z = function(dom, selector) {
    dom = dom || []
    // 包含了$.fn 下的所有属性
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }
  
  // zepto的初始化 其实是在对$()参数判定，分组进行返回
  zepto.init = function(selector, context) {
    var dom
    if (!selector) return zepto.Z()

    // 对字符串进行判断 $('div') $('#nicai') $('.nicai') 
    // $('<p>hello</p>') $('</p>,{text:"代小星是笨蛋"}') 
    else if (typeof selector == 'string') {

      // 对字符串去空格处理
      selector = selector.trim()
      
      // 如果是<>且进行正则验证判断是否正确
      // $('<p>hello</p>')
      //fragementRE /^\s*<(\w+|!)[^>]*>/
      if (selector[0] == '<' && fragmentRE.test(selector))
        // 传入 函数 fragment （选择器 正则 作用域）
        //RegExp.$1 是被匹配到的值 比如传入选择器为'<div>' 那么RegExp.$1 = div
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      
      //如果不是以<>这种而且作用域不为undefined的话   $('</p>,{text:"代小星是笨蛋"}') 
      else if (context !== undefined) return $(context).find(selector)
      
      // 最后就是直接最qsa传入参数 document 和选择器
      //  $('div') $('#nicai') $('.nicai')  
      else dom = zepto.qsa(document, selector)
    }
    
    // 是不是函数
    else if (isFunction(selector)) return $(document).ready(selector)
     
    // 是不是zepto本身对象
    else if (zepto.isZ(selector)) return selector

    //都不存在的情况下
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
        // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
        // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
        // If there's a context, create a collection on that context first, and select
        // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      else dom = zepto.qsa(document, selector)
    }

    // 所有的东西最后都会经过这个函数 dom会返回回来
    return zepto.Z(dom, selector)
  }

  // 模仿jquery的构造模式
  $ = function(selector, context) {
    return zepto.init(selector, context)
  }

  //扩展函数
  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      } else if (source[key] !== undefined) target[key] = source[key]
  }

  $.extend = function(target) {
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg) {
      extend(target, arg, deep)
    })
    return target
  }

  // 这里才是选择器的核心
  zepto.qsa = function(element, selector) {
    var found,
      //判断是不是id选择器
      maybeID = selector[0] == '#',
      // class选择器
      maybeClass = !maybeID && selector[0] == '.',

      // 如果既不是id也不是class的话
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
      
      // 测试'xxx-xxx'
      isSimple = simpleSelectorRE.test(nameOnly);

      // nameOnly其实是最终的选择元素

    // 多元选择符 1?2:3?5:6
    return (isDocument(element) && isSimple && maybeID) ?
      ((found = element.getElementById(nameOnly)) ? [found] : []) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
        maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
        element.getElementsByTagName(selector) : // Or a tag
        element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }
  
  // 暂时都不会用到它，用到再说
  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }
  
  // 判断是否包含节点 下面这句话是因为ie9以上是有containsAPI的
  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }
  
  // 相当于一个函数中转站
  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }
  
  // 移除与设置属性
  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  //暂时不清楚
  function className(node, value) {
    var klass = node.className || '',
      //baseval是对svg的检测
      svg = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  //暂时不清楚
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        (value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value) : value
    } catch (e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  // 判定是不是空对象
  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }
  
  // 返回元素索引
  $.inArray = function(elem, array, i) {
    return emptyArray.indexOf.call(array, elem, i)
  }

  // 对转驼峰重命名
  $.camelCase = camelize

  // 去空格
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  $.uuid = 0
  $.support = {}
  $.expr = {}

  // 对数组或者对象进行遍历 返回数组
  $.map = function(elements, callback) {
    var value, values = [],
      i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      } else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  // 对数组或者对象进行遍历 如果回调返回false则停止
  $.each = function(elements, callback) {
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // 其实就是filter函数
  $.grep = function(elements, callback) {
    return filter.call(elements, callback)
  }

  // json
  if (window.JSON) $.parseJSON = JSON.parse

  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
  })
  
  // 作为zepto的原型链
  //同时挂载函数到$.fn下面
  $.fn = {

    //挂载到$对象下的数组函数
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,
    map: function(fn) {
      return $($.map(this, function(el, i) {
        return fn.call(el, i, el)
      }))
    },
    // 这个外面包裹一层$()是为了返回一个$()对象
    slice: function() {
      return $(slice.apply(this, arguments))
    },

    // 延迟加载
    ready: function(callback) {
     
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function() {
        callback($)
      }, false)
      return this
    },
    // 获取第几个 如果是负数则返回num+length
    get: function(idx) {
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    // 转化为数组
    toArray: function() {
      return this.get()
    },
    // 长度
    size: function() {
      return this.length
    },
    // 移除某个节点
    remove: function() {
      return this.each(function() {
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    // 测试是不是每一个都可以通过
    each: function(callback) {
      emptyArray.every.call(this, function(el, idx) {
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    //检测是否全部匹配选择器 暂时还不能理解
    filter: function(selector) {
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element) {
        return zepto.matches(element, selector)
      }))
    },

    // 把元素添加到集合中
    add: function(selector, context) {
      return $(uniq(this.concat($(selector, context))))
    },
    // 判断第一个是不是符合选择器
    is: function(selector) {
      return this.length > 0 && zepto.matches(this[0], selector)
    },

    // 所有获取到的对象都转换为一个集合，除去集合中的某一个元素
    not: function(selector) {
      var nodes = []
      // 通过函数进行过滤
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx) {
          if (!selector.call(this, idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el) {
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    // 判断当前子元素的集合是否符合当前选择器
    has: function(selector) {
      return this.filter(function() {
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx) {
      return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
    },
    first: function() {
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function() {
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector) {
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function() {
          var node = this
          return emptyArray.some.call($this, function(parent) {
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function() {
        return zepto.qsa(this, selector)
      })
      return result
    },
    // 从当前开始逐级像上匹配
    closest: function(selector, context) {
      var node = this[0],
        collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector) {
      var ancestors = [],
        nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node) {
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector) {
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector) {
      return filtered(this.map(function() {
        return children(this)
      }), selector)
    },
    contents: function() {
      return this.map(function() {
        return slice.call(this.childNodes)
      })
    },
    siblings: function(selector) {
      return filtered(this.map(function(i, el) {
        return filter.call(children(el.parentNode), function(child) {
          return child !== el
        })
      }), selector)
    },
    empty: function() {
      return this.each(function() {
        this.innerHTML = ''
      })
    },
    // 获取元素的所有选择器属性
    pluck: function(property) {
      return $.map(this, function(el) {
        return el[property]
      })
    },
    show: function() {
      return this.each(function() {
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent) {
      return this.before(newContent).remove()
    },
    wrap: function(structure) {
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom = $(structure).get(0),
          clone = dom.parentNode || this.length > 1

      return this.each(function(index) {
        $(this).wrapAll(
          func ? structure.call(this, index) :
          clone ? dom.cloneNode(true) : dom
        )
      })
    },


    wrapAll: function(structure) {
      if (this[0]) {
        // 先生成一个要包含的父元素在第一获取到的元素之前
        $(this[0]).before(structure = $(structure))
        var children
        while ((children = structure.children()).length) 
        {
          structure = children.first() 
        }
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure) {
      var func = isFunction(structure)
      return this.each(function(index) {
        var self = $(this),
          contents = self.contents(),
          dom = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function() {
      this.parent().each(function() {
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function() {
      return this.map(function() {
        return this.cloneNode(true)
      })
    },
    hide: function() {
      return this.css("display", "none")
    },
    toggle: function(setting) {
      return this.each(function() {
        var el = $(this);
        (setting === undefined ? el.css("display") == "none" : setting) ? el.show(): el.hide()
      })
    },
    prev: function(selector) {
      return $(this.pluck('previousElementSibling')).filter(selector || '*')
    },
    next: function(selector) {
      return $(this.pluck('nextElementSibling')).filter(selector || '*')
    },
    html: function(html) {
      return 0 in arguments ?
        this.each(function(idx) {
          var originHtml = this.innerHTML
          $(this).empty().append(funcArg(this, html, idx, originHtml))
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text) {
      return 0 in arguments ?
        this.each(function(idx) {
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : '' + newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value) {
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx) {
          if (this.nodeType !== 1) return
          if (isObject(name))
            for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name) {
      return this.each(function() {
        this.nodeType === 1 && name.split(' ').forEach(function(attribute) {
          setAttribute(this, attribute)
        }, this)
      })
    },
    prop: function(name, value) {
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx) {
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value) {
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value) {
      return 0 in arguments ?
        this.each(function(idx) {
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
          $(this[0]).find('option').filter(function() {
            return this.selected
          }).pluck('value') :
          this[0].value))
    },
    // 当前元素对于document的位置
    offset: function(coordinates) {
      // 如果存在的情况
      if (coordinates) return this.each(function(index) {
        var $this = $(this),
          coords = funcArg(this, coordinates, index, $this.offset()),
          parentOffset = $this.offsetParent().offset(),
          props = {
            top: coords.top - parentOffset.top,
            left: coords.left - parentOffset.left
          }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value) {
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if (!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop) {
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function() {
            this.style.removeProperty(dasherize(property))
          })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function() {
              this.style.removeProperty(dasherize(key))
            })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function() {
        this.style.cssText += ';' + css
      })
    },
    index: function(element) {
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name) {
      if (!name) return false
      return emptyArray.some.call(this, function(el) {
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name) {
      if (!name) return this
      return this.each(function(idx) {
        if (!('className' in this)) return
        classList = []
        var cls = className(this),
          newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass) {
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name) {
      return this.each(function(idx) {
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when) {
      if (!name) return this
      return this.each(function(idx) {
        var $this = $(this),
          names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass) {
          (when === undefined ? !$this.hasClass(klass) : when) ?
          $this.addClass(klass): $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value) {
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function() {
          this.scrollTop = value
        } :
        function() {
          this.scrollTo(this.scrollX, value)
        })
    },
    scrollLeft: function(value) {
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function() {
          this.scrollLeft = value
        } :
        function() {
          this.scrollTo(value, this.scrollY)
        })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
          top: 0,
          left: 0
        } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top -= parseFloat($(elem).css('margin-top')) || 0
      offset.left -= parseFloat($(elem).css('margin-left')) || 0

      // Add offsetParent borders
      parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
      parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

      // Subtract the two offsets
      return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function() {
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  $.fn.detach = $.fn.remove;

  ['width', 'height'].forEach(function(dimension) {
    var dimensionProperty =
      dimension.replace(/./, function(m) {
        return m[0].toUpperCase()
      })

    $.fn[dimension] = function(value) {
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx) {
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function() {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
          argType = type(arg)
          return argType == "object" || argType == "array" || arg == null ?
            arg : zepto.fragment(arg)
        }),
        parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target) {
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
          operatorIndex == 1 ? target.firstChild :
          operatorIndex == 2 ? target :
          null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node) {
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el) {
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
              (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function(html) {
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue

  //zepto申明的是空对象zepto = {}
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto

// 防框架冲突处理
window.$ === undefined && (window.$ = Zepto)

;
// 事件模块
(function($) {
  // 其实是事件id，从1开始
  var _zid = 1,
    undefined,
    slice = Array.prototype.slice,
    isFunction = $.isFunction,
    isString = function(obj) {
      return typeof obj == 'string'
    },
    handlers = {},
    specialEvents = {},
    // 判断是否有onfocusin属性
    focusinSupported = 'onfocusin' in window,
    focus = {
      focus: 'focusin',
      blur: 'focusout'
    },
    hover = {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
    }

  //所有的事件都称之为MouseEvents事件
  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  // specialEvents   Object {mousemove: "MouseEvents", mouseup: "MouseEvents", mousedown: "MouseEvents", click: "MouseEvents"}
 
  //比如$('li').on('click',fn) 我需要为每一个对事件生成一个id
  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }

  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector)
    })
  }
  
  // 对于有事件命名空间的形式进行处理
  function parse(event) {
    var parts = ('' + event).split('.')
    return {
      // 事件名
      e: parts[0],
      // 事件命名空间
      ns: parts.slice(1).sort().join(' ')
    }
  }

  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) || !!captureSetting
  }
   
  // 判断是不是hover 或者focus事件 如果不是则直接返回本来事件
  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  // 对象/事件/函数/数据/选择器/
  function add(element, events, fn, data, selector, delegator, capture) {

   //为事件增加id
    var id = zid(element),
    // 判断事件对象里面是不是有了，有了就返回，没有就给个空数组
      set = (handlers[id] || (handlers[id] = []));
    
    // 我猜的话应该是 同一个对象可以绑定多种事件$('li').on("click hover")
    events.split(/\s/).forEach(function(event) {
      // 判断是不是ready事件如果是直接调ready函数行了
      if (event == 'ready') return $(document).ready(fn)

      // 命名空间处理
      var handler = parse(event)
      // 绑回调
      handler.fn = fn
      handler.sel = selector
      //handler  Object {e: "clcik", ns: "", fn: function, sel: undefined}
        // 判定 mouseenter, mouseleave 如果是的话 对fn进行改变
      if (handler.e in hover) fn = function(e) {

        // relatedTarget主要是mouseover和mouseout的属性 划入或者划出
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      // delegator不传的话就是undefinde
      handler.del = delegator
      var callback = delegator || fn
      handler.proxy = function(e) {
        e = compatible(e)
        // 取消事件传播
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        // 回调绑定
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
      {
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      }
    })
  }

  function remove(element, events, fn, selector, capture) {
    var id = zid(element);
    (events || '').split(/\s/).forEach(function(event) {
      findHandlers(element, event, fn, selector).forEach(function(handler) {
        delete handlers[id][handler.i]
        if ('removeEventListener' in element)
          element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = {
    add: add,
    remove: remove
  }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function() {
        return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments)
      }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback) {
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback) {
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback) {
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function() {
      return true
    },
    returnFalse = function() {
      return false
    },
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
      // 取消事件默认行为
      preventDefault: 'isDefaultPrevented',
      //取消事件的进一步发生(dom3)
      stopImmediatePropagation: 'isImmediatePropagationStopped',
       //取消事件的进一步发生(如果bubbles为true)
      stopPropagation: 'isPropagationStopped'
    }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function() {
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
        'returnValue' in source ? source.returnValue === false :
        source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = {
      originalEvent: event
    }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback) {
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback) {
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback) {
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback) {
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }
 
 // 写法和jquery一样啊 还是以on为基准 on用于参数调整 add用于真正绑定
  $.fn.on = function(event, selector, data, callback, one) {
    var autoRemove, delegator, $this = this
    // 事件存在，但是事件不是字符串
    if (event && !isString(event)) {
      $.each(event, function(type, fn) {
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }
    /*下面都是在调正位置*/
    // 选择器不存在 回调不存在
    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    // data是函数或者data是false
    if (isFunction(data) || data === false)
      callback = data, data = undefined
    // 如果回调返回false
    if (callback === false) callback = returnFalse
   
    //上面都是非正常情况下。下面是我们常用的情况
    return $this.each(function(_, element) {
      // _是索引 element是对象
      // one存在在情况下
      if (one) autoRemove = function(e) {
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }
      
      // 选择器存在
      if (selector) delegator = function(e) {
        // 获取目标元素
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          // 设定事件对象
          evt = $.extend(createProxy(e), {
            currentTarget: match,
            liveFired: element
          })
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      // 下面是我们常用的情况
      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback) {
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn) {
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function() {
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args) {
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function() {
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
        // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // 只是出发绑定事件不执行原生事件的影响
  $.fn.triggerHandler = function(event, args) {
    var e, result
    this.each(function(i, element) {
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler) {
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;
  // 对所有事件进行扩展到$.fn上也是对象上 定义了一个事件的基本函数模式 这里其实可以理解为事件的快捷方式
  ('focusin focusout focus blur load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
    // console.log($('li')['click']) 传入一个回调函数
    // 所有事件都会变成这样 function (callback) {
    //   return (0 in arguments) ?
    //     this.bind(event, callback) :
    //     this.trigger(event)
    // }
  })

  // 事件/是否冒泡({bubbles:false})
  $.Event = function(type, props) {
    // 如果不是字符串
    if (!isString(type)) props = type, type = props.type

    //创建一个事件
    var event = document.createEvent(specialEvents[type] || 'Events'),
      bubbles = true
    if (props)
      for (var name in props)(name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }
})(Zepto)
;

//ajax模块
(function($) {
  var jsonpID = 0,
    document = window.document,
    key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/,
    originAnchor = document.createElement('a')

  originAnchor.href = window.location.href


  // 事件控制器
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // 中转函数
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  //设定一个函数执行顺序
  $.active = 0

  // ajax启动函数
  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }

  // ajax停止函数
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
      triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }

  function ajaxSuccess(data, xhr, settings, deferred) {
      var context = settings.context,
        status = 'success'
      settings.success.call(context, data, status, xhr)
      if (deferred) deferred.resolveWith(context, [data, status, xhr])
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
      ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
      var context = settings.context
      settings.error.call(context, xhr, type, error)
      if (deferred) deferred.rejectWith(context, [xhr, type, error])
      triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
      ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred) {
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = {
        abort: abort
      },
      abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType) {
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function() {
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function() {
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  // 设定所有基本配置
  $.ajaxSettings = {
    // 默认请求类型
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function() {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json: jsonType,
      xml: 'application/xml, text/xml',
      html: htmlType,
      text: 'text/plain'
    },
    //是否跨域
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // 是否要转换为字符串
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && (mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml') || 'text'
  }

  // 其实是相当于把jsonp请求放到的get 请求的上面
  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // 增加到get请求
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  // ajax模块中心
  $.ajax = function(options) {
    // 覆盖配置
    var settings = $.extend({}, options || {}),
      // 没有找到在哪里
      deferred = $.Deferred && $.Deferred(),
      urlAnchor
    // 完成完整对配置覆盖
    for (key in $.ajaxSettings)
      if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    // 这里要涉及到三个函数 ajaxStart>triggerGlobal>triggerAndReturn(触发ajax)
    ajaxStart(settings)

    // 是跨域
    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      // 验证是否真的跨域了----确保对参数的修正
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    // 序列化数据
    serializeData(settings)

    var dataType = settings.dataType,
    // 解析地址如果存在回调那么hasplaceholder = true
      hasPlaceholder = /\?.+=\?/.test(settings.url)

    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
        (!options || options.cache !== true) &&
        ('script' == dataType || 'jsonp' == dataType)
      ))
      // 增加一个选择器(不是很明白)
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      // 如果是跨域则用jsonp跨域
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
      headers = {},
      setHeader = function(name, value) {
        headers[name.toLowerCase()] = [name, value]
      },
      protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
      xhr = settings.xhr(),
      nativeSetHeader = xhr.setRequestHeader,
      abortTimeout

    if (deferred) deferred.promise(xhr)

    // 如果是跨域请求
    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers)
      for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    // 监听请求状态
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')(1, eval)(result)
            else if (dataType == 'xml') result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) {
            error = e
          }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields)
      for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    // 设置异步和同步
    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function() {
      xhr.onreadystatechange = empty
      xhr.abort()
      ajaxError(null, 'timeout', xhr, settings, deferred)
    }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url,
      data: data,
      success: success,
      dataType: dataType
    }
  }

  $.get = function( /* url, data, success, dataType */ ) {
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function( /* url, data, success, dataType */ ) {
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function( /* url, data, success */ ) {
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success) {
    if (!this.length) return this
    var self = this,
      parts = url.split(/\s/),
      selector,
      options = parseArguments(url, data, success),
      callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response) {
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector) : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  // 对参数进行处理
  function serialize(params, obj, traditional, scope) {
    var type, array = $.isArray(obj),
      hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
        // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  //序列化数据(转换位字符串)
  $.param = function(obj, traditional) {
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
        // 进行编码
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    // 对为空参数的处理
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)
;

// form事件
(function($) {

  // 将表单数组化
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({
          name: name,
          value: value
        })
      }
    if (this[0]) $.each(this[0].elements, function(_, field) {
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
        add($(field).val())
    })
    return result
  }

  $.fn.serialize = function() {
    var result = []
    this.serializeArray().forEach(function(elm) {
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }
})(Zepto)
;


// __proto__ doesn't exist on IE<11, so redefine
(function($) {
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector) {
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object) {
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch (e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element) {
      try {
        return nativeGetComputedStyle(element)
      } catch (e) {
        return null
      }
    }
  }
})(Zepto)

