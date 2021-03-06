function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/data-structure.js']) {
  _$jscoverage['/data-structure.js'] = {};
  _$jscoverage['/data-structure.js'].lineData = [];
  _$jscoverage['/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/data-structure.js'].lineData[31] = 0;
  _$jscoverage['/data-structure.js'].lineData[40] = 0;
  _$jscoverage['/data-structure.js'].lineData[48] = 0;
  _$jscoverage['/data-structure.js'].lineData[55] = 0;
  _$jscoverage['/data-structure.js'].lineData[63] = 0;
  _$jscoverage['/data-structure.js'].lineData[71] = 0;
  _$jscoverage['/data-structure.js'].lineData[79] = 0;
  _$jscoverage['/data-structure.js'].lineData[87] = 0;
  _$jscoverage['/data-structure.js'].lineData[91] = 0;
  _$jscoverage['/data-structure.js'].lineData[98] = 0;
  _$jscoverage['/data-structure.js'].lineData[99] = 0;
  _$jscoverage['/data-structure.js'].lineData[103] = 0;
  _$jscoverage['/data-structure.js'].lineData[108] = 0;
  _$jscoverage['/data-structure.js'].lineData[113] = 0;
  _$jscoverage['/data-structure.js'].lineData[118] = 0;
  _$jscoverage['/data-structure.js'].lineData[121] = 0;
  _$jscoverage['/data-structure.js'].lineData[122] = 0;
  _$jscoverage['/data-structure.js'].lineData[123] = 0;
  _$jscoverage['/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/data-structure.js'].lineData[126] = 0;
  _$jscoverage['/data-structure.js'].lineData[130] = 0;
  _$jscoverage['/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/data-structure.js'].lineData[145] = 0;
  _$jscoverage['/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/data-structure.js'].lineData[153] = 0;
  _$jscoverage['/data-structure.js'].lineData[154] = 0;
  _$jscoverage['/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/data-structure.js'].lineData[164] = 0;
  _$jscoverage['/data-structure.js'].lineData[166] = 0;
  _$jscoverage['/data-structure.js'].lineData[167] = 0;
  _$jscoverage['/data-structure.js'].lineData[168] = 0;
  _$jscoverage['/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/data-structure.js'].lineData[187] = 0;
  _$jscoverage['/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/data-structure.js'].lineData[191] = 0;
  _$jscoverage['/data-structure.js'].lineData[193] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/data-structure.js'].lineData[218] = 0;
  _$jscoverage['/data-structure.js'].lineData[219] = 0;
  _$jscoverage['/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/data-structure.js'].lineData[230] = 0;
  _$jscoverage['/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/data-structure.js'].lineData[234] = 0;
  _$jscoverage['/data-structure.js'].lineData[242] = 0;
  _$jscoverage['/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/data-structure.js'].lineData[251] = 0;
  _$jscoverage['/data-structure.js'].lineData[252] = 0;
  _$jscoverage['/data-structure.js'].lineData[256] = 0;
  _$jscoverage['/data-structure.js'].lineData[257] = 0;
  _$jscoverage['/data-structure.js'].lineData[258] = 0;
  _$jscoverage['/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/data-structure.js'].lineData[263] = 0;
  _$jscoverage['/data-structure.js'].lineData[272] = 0;
  _$jscoverage['/data-structure.js'].lineData[273] = 0;
  _$jscoverage['/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/data-structure.js'].lineData[293] = 0;
  _$jscoverage['/data-structure.js'].lineData[294] = 0;
  _$jscoverage['/data-structure.js'].lineData[295] = 0;
  _$jscoverage['/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/data-structure.js'].lineData[307] = 0;
  _$jscoverage['/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/data-structure.js'].lineData[310] = 0;
  _$jscoverage['/data-structure.js'].lineData[312] = 0;
  _$jscoverage['/data-structure.js'].lineData[320] = 0;
  _$jscoverage['/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/data-structure.js'].lineData[330] = 0;
  _$jscoverage['/data-structure.js'].lineData[332] = 0;
  _$jscoverage['/data-structure.js'].lineData[333] = 0;
  _$jscoverage['/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/data-structure.js'].lineData[339] = 0;
}
if (! _$jscoverage['/data-structure.js'].functionData) {
  _$jscoverage['/data-structure.js'].functionData = [];
  _$jscoverage['/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/data-structure.js'].functionData[30] = 0;
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['166'] = [];
  _$jscoverage['/data-structure.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['167'] = [];
  _$jscoverage['/data-structure.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['183'] = [];
  _$jscoverage['/data-structure.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['187'] = [];
  _$jscoverage['/data-structure.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['190'] = [];
  _$jscoverage['/data-structure.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['193'] = [];
  _$jscoverage['/data-structure.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['203'] = [];
  _$jscoverage['/data-structure.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['207'] = [];
  _$jscoverage['/data-structure.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['208'] = [];
  _$jscoverage['/data-structure.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['211'] = [];
  _$jscoverage['/data-structure.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['218'] = [];
  _$jscoverage['/data-structure.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['231'] = [];
  _$jscoverage['/data-structure.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['251'] = [];
  _$jscoverage['/data-structure.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['252'] = [];
  _$jscoverage['/data-structure.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['257'] = [];
  _$jscoverage['/data-structure.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['261'] = [];
  _$jscoverage['/data-structure.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['273'] = [];
  _$jscoverage['/data-structure.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['282'] = [];
  _$jscoverage['/data-structure.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['293'] = [];
  _$jscoverage['/data-structure.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['294'] = [];
  _$jscoverage['/data-structure.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['295'] = [];
  _$jscoverage['/data-structure.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['325'] = [];
  _$jscoverage['/data-structure.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['325'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['326'] = [];
  _$jscoverage['/data-structure.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['327'] = [];
  _$jscoverage['/data-structure.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['329'] = [];
  _$jscoverage['/data-structure.js'].branchData['329'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['329'][1].init(112, 35, 'normalizedRequiresStatus === status');
function visit143_329_1(result) {
  _$jscoverage['/data-structure.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['327'][1].init(338, 149, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit142_327_1(result) {
  _$jscoverage['/data-structure.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['326'][1].init(24, 14, 'requires || []');
function visit141_326_1(result) {
  _$jscoverage['/data-structure.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['325'][2].init(249, 21, 'requires.length === 0');
function visit140_325_2(result) {
  _$jscoverage['/data-structure.js'].branchData['325'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['325'][1].init(236, 34, '!requires || requires.length === 0');
function visit139_325_1(result) {
  _$jscoverage['/data-structure.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['295'][1].init(249, 18, '!requiresWithAlias');
function visit138_295_1(result) {
  _$jscoverage['/data-structure.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['294'][1].init(24, 14, 'requires || []');
function visit137_294_1(result) {
  _$jscoverage['/data-structure.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['293'][2].init(161, 21, 'requires.length === 0');
function visit136_293_2(result) {
  _$jscoverage['/data-structure.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['293'][1].init(148, 34, '!requires || requires.length === 0');
function visit135_293_1(result) {
  _$jscoverage['/data-structure.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['282'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit134_282_1(result) {
  _$jscoverage['/data-structure.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['273'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit133_273_1(result) {
  _$jscoverage['/data-structure.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['261'][1].init(404, 37, 'packages[pName] || Config.corePackage');
function visit132_261_1(result) {
  _$jscoverage['/data-structure.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['257'][2].init(68, 23, 'p.length > pName.length');
function visit131_257_2(result) {
  _$jscoverage['/data-structure.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['257'][1].init(25, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit130_257_1(result) {
  _$jscoverage['/data-structure.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['252'][1].init(32, 21, 'Config.packages || {}');
function visit129_252_1(result) {
  _$jscoverage['/data-structure.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['251'][1].init(46, 17, '!self.packageInfo');
function visit128_251_1(result) {
  _$jscoverage['/data-structure.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['231'][1].init(46, 9, '!self.url');
function visit127_231_1(result) {
  _$jscoverage['/data-structure.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['218'][1].init(748, 11, '!ret.length');
function visit126_218_1(result) {
  _$jscoverage['/data-structure.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['211'][1].init(153, 11, 'normalAlias');
function visit125_211_1(result) {
  _$jscoverage['/data-structure.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['208'][1].init(21, 8, 'alias[i]');
function visit124_208_1(result) {
  _$jscoverage['/data-structure.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['207'][1].init(334, 5, 'i < l');
function visit123_207_1(result) {
  _$jscoverage['/data-structure.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['203'][1].init(186, 25, 'typeof alias === \'string\'');
function visit122_203_1(result) {
  _$jscoverage['/data-structure.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['199'][1].init(46, 20, 'self.normalizedAlias');
function visit121_199_1(result) {
  _$jscoverage['/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['193'][1].init(508, 11, 'alias || []');
function visit120_193_1(result) {
  _$jscoverage['/data-structure.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['190'][1].init(384, 34, '!alias && (aliasFn = Config.alias)');
function visit119_190_1(result) {
  _$jscoverage['/data-structure.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['187'][1].init(284, 17, 'packageInfo.alias');
function visit118_187_1(result) {
  _$jscoverage['/data-structure.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['183'][1].init(170, 5, 'alias');
function visit117_183_1(result) {
  _$jscoverage['/data-structure.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['167'][1].init(21, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit116_167_1(result) {
  _$jscoverage['/data-structure.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['166'][1].init(77, 2, '!v');
function visit115_166_1(result) {
  _$jscoverage['/data-structure.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/data-structure.js'].functionData[0]++;
  _$jscoverage['/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Config = S.Config, Utils = Loader.Utils, mix = Utils.mix;
  _$jscoverage['/data-structure.js'].lineData[12]++;
  function checkGlobalIfNotExist(self, property) {
    _$jscoverage['/data-structure.js'].functionData[1]++;
    _$jscoverage['/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : Config[property];
  }
  _$jscoverage['/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/data-structure.js'].functionData[2]++;
    _$jscoverage['/data-structure.js'].lineData[24]++;
    mix(this, cfg);
  }
  _$jscoverage['/data-structure.js'].lineData[27]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/data-structure.js'].functionData[3]++;
  _$jscoverage['/data-structure.js'].lineData[31]++;
  mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[4]++;
  _$jscoverage['/data-structure.js'].lineData[40]++;
  return checkGlobalIfNotExist(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[48]++;
  return this.name;
}, 
  getBase: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[55]++;
  return this.base;
}, 
  isDebug: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[63]++;
  return checkGlobalIfNotExist(this, 'debug');
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[71]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[9]++;
  _$jscoverage['/data-structure.js'].lineData[79]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[10]++;
  _$jscoverage['/data-structure.js'].lineData[87]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[91]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[98]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[11]++;
    _$jscoverage['/data-structure.js'].lineData[99]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[103]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[108]++;
    self.status = Loader.Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[113]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[118]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[121]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[122]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[123]++;
    self.waits = {};
    _$jscoverage['/data-structure.js'].lineData[125]++;
    self.require = function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[126]++;
  return S.require(moduleName, self.name);
};
  }
  _$jscoverage['/data-structure.js'].lineData[130]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[137]++;
  return Utils.normalizePath(this.name, relativeName);
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[141]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[145]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[149]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[153]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[154]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[156]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[164]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[166]++;
  if (visit115_166_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[167]++;
    if (visit116_167_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[168]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[170]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[172]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[174]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[178]++;
  var self = this, name = self.name, aliasFn, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[183]++;
  if (visit117_183_1(alias)) {
    _$jscoverage['/data-structure.js'].lineData[184]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[186]++;
  packageInfo = self.getPackage();
  _$jscoverage['/data-structure.js'].lineData[187]++;
  if (visit118_187_1(packageInfo.alias)) {
    _$jscoverage['/data-structure.js'].lineData[188]++;
    alias = packageInfo.alias(name);
  }
  _$jscoverage['/data-structure.js'].lineData[190]++;
  if (visit119_190_1(!alias && (aliasFn = Config.alias))) {
    _$jscoverage['/data-structure.js'].lineData[191]++;
    alias = aliasFn(name);
  }
  _$jscoverage['/data-structure.js'].lineData[193]++;
  alias = self.alias = visit120_193_1(alias || []);
  _$jscoverage['/data-structure.js'].lineData[194]++;
  return alias;
}, 
  getNormalizedAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[198]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[199]++;
  if (visit121_199_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[200]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[202]++;
  var alias = self.getAlias();
  _$jscoverage['/data-structure.js'].lineData[203]++;
  if (visit122_203_1(typeof alias === 'string')) {
    _$jscoverage['/data-structure.js'].lineData[204]++;
    alias = [alias];
  }
  _$jscoverage['/data-structure.js'].lineData[206]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[207]++;
  for (var i = 0, l = alias.length; visit123_207_1(i < l); i++) {
    _$jscoverage['/data-structure.js'].lineData[208]++;
    if (visit124_208_1(alias[i])) {
      _$jscoverage['/data-structure.js'].lineData[209]++;
      var mod = Utils.createModuleInfo(alias[i]);
      _$jscoverage['/data-structure.js'].lineData[210]++;
      var normalAlias = mod.getNormalizedAlias();
      _$jscoverage['/data-structure.js'].lineData[211]++;
      if (visit125_211_1(normalAlias)) {
        _$jscoverage['/data-structure.js'].lineData[212]++;
        ret.push.apply(ret, normalAlias);
      } else {
        _$jscoverage['/data-structure.js'].lineData[214]++;
        ret.push(alias[i]);
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[218]++;
  if (visit126_218_1(!ret.length)) {
    _$jscoverage['/data-structure.js'].lineData[219]++;
    ret.push(self.name);
  }
  _$jscoverage['/data-structure.js'].lineData[221]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[222]++;
  return ret;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[230]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[231]++;
  if (visit127_231_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[232]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[234]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[242]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[250]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[251]++;
  if (visit128_251_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[252]++;
    var packages = visit129_252_1(Config.packages || {}), modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[256]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[257]++;
      if (visit130_257_1(Utils.startsWith(modNameSlash, p + '/') && visit131_257_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[258]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[261]++;
    self.packageInfo = visit132_261_1(packages[pName] || Config.corePackage);
  }
  _$jscoverage['/data-structure.js'].lineData[263]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[272]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[273]++;
  return visit133_273_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[281]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[282]++;
  return visit134_282_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[290]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[293]++;
  if (visit135_293_1(!requires || visit136_293_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[294]++;
    return visit137_294_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[295]++;
    if (visit138_295_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[296]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[299]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[307]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[308]++;
  var mods = [];
  _$jscoverage['/data-structure.js'].lineData[309]++;
  Utils.each(self.getNormalizedRequires(), function(r, i) {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[310]++;
  mods[i] = Utils.createModuleInfo(r);
});
  _$jscoverage['/data-structure.js'].lineData[312]++;
  return mods;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[30]++;
  _$jscoverage['/data-structure.js'].lineData[320]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[325]++;
  if (visit139_325_1(!requires || visit140_325_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[326]++;
    return visit141_326_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[327]++;
    if (visit142_327_1((normalizedRequires = self.normalizedRequires) && (visit143_329_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[330]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[332]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[333]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[334]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[339]++;
  Loader.Module = Module;
})(KISSY);
