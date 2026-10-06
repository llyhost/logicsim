function LogicParser(npn) {
    var andM = function (a, b) {
        return {
            "S": a,
            "0": "0",
            "1": {
                "S": b,
                "0": "0",
                "1": "1"
            }
        }
    };
    var orM = function (a, b) {
        return {
            "S": a,
            "0": {
                "S": b,
                "0": "0",
                "1": "1"
            },
            "1": "1"
        }
    };
    var notM = function (a) {
        return {
            "S": a,
            "0": "1",
            "1": "0"
        }
    };
    var infM = function (a, b) {
        return {
            "S": a,
            "0": "1",
            "1": {
                "S": b,
                "0": "0",
                "1": "1"
            }
        }
    };
    var equalM = function (a, b) {
        return {
            "S": a,
            "0": {
                "S": b,
                "0": "1",
                "1": "0"
            },
            "1": {
                "S": b,
                "0": "0",
                "1": "1"
            }
        }
    };
    var state = 0;
    var nstate = 0;
    /* state is
       0: tic
       1: toc
       we parse:
       ".": "and",
       ",": "or",
       ">": "infer",
       "<": "not"
       "=": "equal"
     */
    if ("" == npn) { return "Empty String!" };
    for (var e = [], s = npn.split(/(\.|,|<|>|=|\s)/), t = 0;
        t < s.length; t++) {
        var n = s[t];
        if ("" == n) { }
        else if (n.match(/\s/)) {
            if (1 == state) { state = 0; nstate++; }
        }
        else if (n.match(/\./)) {
            var temp1 = e.pop();
            var temp2 = e.pop();
            if (1 == state) {
                return "use wrong Name as variable"
            }
            else if (undefined == temp1 || undefined == temp2) {
                return "Format Error: arguments less than needed"
            }
            else {
                e.push(andM(temp2, temp1));
                nstate--;
            }
        }
        else if (n.match(/,/)) {
            var temp1 = e.pop();
            var temp2 = e.pop();
            if (1 == state) {
                return "use wrong Name as variable"
            }
            else if (undefined == temp1 || undefined == temp2) {
                return "Format Error: arguments less than needed"
            }
            else {
                e.push(orM(temp2, temp1));
                nstate--;
            }
        }
        else if (n.match(/</)) {
            var temp1 = e.pop();
            if (1 == state) {
                return "use wrong Name as variable"
            }
            else if (undefined == temp1) {
                return "Format Error: arguments less than needed"
            }
            else {
                e.push(notM(temp1));
            }
        }
        else if (n.match(/>/)) {
            var temp1 = e.pop();
            var temp2 = e.pop();
            if (1 == state) {
                return "use wrong Name as variable"
            }
            else if (undefined == temp1 || undefined == temp2) {
                return "Format Error: arguments less than needed"
            }
            else {
                e.push(infM(temp2, temp1));
                nstate--;
            }
        }
        else if (n.match(/=/)) {
            var temp1 = e.pop();
            var temp2 = e.pop();
            if (1 == state) {
                return "use wrong Name as variable"
            }
            else if (undefined == temp1 || undefined == temp2) {
                return "Format Error: arguments less than needed"
            }
            else {
                e.push(equalM(temp2, temp1));
                nstate--;
            }
        }
        else {
            if (0 == state) {
                state = 1;
                e.push(n);
            }

        }

    };
    if (nstate > 1) { return "Format Error: arguments more than needed" };
    return e.pop();
};

function ModelGen(np) {
    /* 0:"<"
       1:">" */
    var result = {
        value: [],
        order: []
    };
    if ("string" == typeof (np)) {
        if ("1" == np) {
            result.value = [{ ".": ">" }];
            result.order = [];
        } else if ("0" == np) {
            result.value = [{ ".": "<" }];
            result.order = [];
        } else {
            var temp1 = { ".": ">" };
            var temp2 = { ".": "<" };
            temp1[np] = ">";
            temp2[np] = "<";
            result.value = [temp1, temp2];
            result.order = [np];
        }

    }
    else {
        var result1 = ModelGen(np.S);

        if (0 == result1.order.length) {
            if ("<" == result1.value[0]["."]) {
                result = ModelGen(np[0]);
            } else {
                result = ModelGen(np[1]);
            }
        }
        else {
            var myset = new Set(result1.order);

            var result2 = ModelGen(np[0]);
            var intersection2 = result2.order.filter(x => myset.has(x));

            var result3 = ModelGen(np[1]);
            var intersection3 = result3.order.filter(x => myset.has(x));

            var all0 = false;
            var all1 = false;

            for (let x of result1.value) {
                if ("<" == x["."]) {
                    for (let y of result2.value) {
                        var YesOrNot = true;
                        for (let z of intersection2) {
                            if (undefined != x[z] && undefined != y[z] && x[z] != y[z]) {
                                YesOrNot = false;
                                break;
                            }
                        };
                        if (YesOrNot) {
                            var newValue = {};
                            for (var k in x) {
                                var item = x[k];
                                newValue[k] = item;
                            }
                            for (let alpha of result2.order) {
                                if (undefined != y[alpha]) {
                                    newValue[alpha] = y[alpha];
                                }
                            };
                            newValue["."] = y["."];
                            if (">" == newValue["."]) {
                                all1 = true;
                            } else {
                                all0 = true;
                            };
                            result.value.push(newValue);
                        }
                    }
                }
                else {
                    for (let y of result3.value) {
                        var YesOrNot = true;
                        for (let z of intersection3) {
                            if (undefined != x[z] && undefined != y[z] && x[z] != y[z]) {
                                YesOrNot = false;
                                break;
                            }
                        };
                        if (YesOrNot) {
                            var newValue = {};
                            for (var k in x) {
                                var item = x[k];
                                newValue[k] = item;
                            }
                            for (let alpha of result3.order) {
                                if (undefined != y[alpha]) {
                                    newValue[alpha] = y[alpha];
                                }
                            };
                            newValue["."] = y["."];
                            if (">" == newValue["."]) {
                                all1 = true;
                            } else {
                                all0 = true;
                            };
                            result.value.push(newValue);
                        }
                    }
                }
            };
            if (all0 && !all1) {
                result = {
                    value: [{ ".": "<" }],
                    order: []
                }
            } else if (all1 && !all0) {
                result = {
                    value: [{ ".": ">" }],
                    order: []
                }
            }
            else {
                var tempOrder = new Set(
                    result1.order.concat(result2.order).concat(result3.order)
                );
                result.order = Array.from(tempOrder);
            }
        }
    }
    return result;
}

/* ============================================================
 * 量词扩展（本次改造新增）
 * 在原有五种逻辑运算符（. 与、, 或、< 非、> 蕴含、= 等价）之外，
 * 增加两种命题量词：
 *   "A x @"  表示  ∀x.A （全称量词，x 取遍 0/1 时 A 均为真）
 *   "A x #"  表示  ∃x.A （存在量词，x 取 0 或 1 时 A 为真）
 *
 * 实现原理：命题逻辑的量词可以按定义展开（量词消去）：
 *   ∀x.A  ≡  A(x:=0) ∧ A(x:=1)   →  "A(x:=0) A(x:=1) ."
 *   ∃x.A  ≡  A(x:=0) ∨ A(x:=1)   →  "A(x:=0) A(x:=1) ,"
 * 本函数在逆波兰式 token 层做变量替换与展开，把含量词的
 * 表达式化归为只含五种基本运算符的逆波兰式，再交给原 LogicParser。
 *
 * 返回值：成功返回展开后的字符串；失败返回 { error: "..." }。
 * ============================================================ */
function QuantifierExpand(npn) {
    if (undefined == npn || "" == npn) { return npn; }
    /* 与原解析器同风格的切词：把运算符、量词、空白切为独立 token */
    var tokens = npn.split(/(\.|,|<|>|=|@|#|\s)/).filter(function (t) {
        return "" != t && !/\s/.test(t);
    });
    function isOp(t) {
        return "." == t || "," == t || "<" == t || ">" == t || "=" == t;
    }
    /* 把子表达式 token 列表中的变量 v 全部替换为常量 c（0 或 1） */
    function subst(list, v, c) {
        return list.map(function (t) { return t === v ? c : t; });
    }
    var stack = [];
    for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if ("@" == t || "#" == t) {
            /* 量词：紧邻其前的 token 必须是单个变量名，再往前是作用的表达式 */
            var v = stack.pop();
            var A = stack.pop();
            if (undefined == v || undefined == A) {
                return { error: "Quantifier Error: '" + t + "' 之前缺少表达式或变量名" };
            }
            if (1 != v.length || isOp(v[0]) || "@" == v[0] || "#" == v[0]) {
                return { error: "Quantifier Error: '" + t + "' 必须紧跟单个变量名，如：A x " + t };
            }
            if ("0" == v[0] || "1" == v[0]) {
                return { error: "Quantifier Error: 不能对常量 '" + v[0] + "' 使用量词" };
            }
            var glue = ("@" == t) ? "." : ",";   /* ∀ 展开为与，∃ 展开为或 */
            stack.push(subst(A, v[0], "0").concat(subst(A, v[0], "1"), [glue]));
        }
        else if (isOp(t)) {
            if ("<" == t) {
                var B = stack.pop();
                if (undefined == B) {
                    return { error: "Format Error: arguments less than needed" };
                }
                stack.push(B.concat([t]));
            } else {
                var B2 = stack.pop();
                var A2 = stack.pop();
                if (undefined == B2 || undefined == A2) {
                    return { error: "Format Error: arguments less than needed" };
                }
                stack.push(A2.concat(B2, [t]));
            }
        }
        else {
            stack.push([t]);
        }
    }
    if (1 != stack.length) {
        return { error: "Format Error: arguments more than needed" };
    }
    return stack[0].join(" ");
}

function ViewGen(pn) {
    var countKey = 2;
    var result = {
        nodeArray: [
            { "key": "0", "type": "0", "name": "Zero" },
            { "key": 1, "type": "1", "name": "One" },
            { "key": 2, "type": "Export", "name": "Out" }
        ],
        linkArray: []
    }
    function ViewGen0(pnp, NodeKey, PortId) {
        if (1 == pnp.value.length) {
            if ("<" == pnp.value[0]["."]) {
                return {
                    nodeArray: [],
                    linkArray: [{ "from": "0", "frompid": "OUT", "to": NodeKey, "topid": PortId }]
                };
            } else {
                return {
                    nodeArray: [],
                    linkArray: [{ "from": 1, "frompid": "OUT", "to": NodeKey, "topid": PortId }]
                };
            }
        }
        else {
            var CName = "";
            for (CName0 of pnp.order) {
                if (pnp.value.length == pnp.value.filter(function (x) { return undefined != x[CName0] }).length) {
                    CName = CName0;
                }
            }

            if ("" != CName) {
                var TempOrder = pnp.order.filter(function(x){
                    return x  != CName
                });

                var pnp1 = {
                    value: pnp.value.filter(function (x) { return "<" == x[CName] }),
                    order: TempOrder
                };
                var pnp2 = {
                    value: pnp.value.filter(function (x) { return ">" == x[CName] }),
                    order: TempOrder
                };

                countKey++;
                var NodeKeyNow = countKey;
                var NodeLink1 = ViewGen0(pnp1, NodeKeyNow, "0");
                var NodeLink2 = ViewGen0(pnp2, NodeKeyNow, "1");

                return {
                    nodeArray: [{ "key": NodeKeyNow, "type": "SEL" }].concat(NodeLink1.nodeArray, NodeLink2.nodeArray),
                    linkArray: [{ "from": NodeKeyNow, "frompid": "N", "to": NodeKey, "topid": PortId },
                    { "from": CName, "frompid": "OUT", "to": NodeKeyNow, "topid": "SI" }].concat(NodeLink1.linkArray, NodeLink2.linkArray)
                };
            }
        }
    };
    for (x of pn.order) {
        result.nodeArray = result.nodeArray.concat({ "key": x, "type": "Import", "name": x })
    }
    var temp = ViewGen0(pn, countKey, "OUT");
    result.nodeArray = result.nodeArray.concat(temp.nodeArray);
    result.linkArray = result.linkArray.concat(temp.linkArray);
    return result;
}