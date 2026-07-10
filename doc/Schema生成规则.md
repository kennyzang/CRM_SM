# Schema 生成规则

## 概述

Schema 是表单字段结构的 JSON 描述文件，用于驱动自动化测试的表单填充。

## 数据来源

Schema 数据**仅从 API 获取**，不探查 DOM。所有信息都存在于以下两个接口的响应中：

1. `/sysModelingMain/init` - 初始化接口，返回 auth 权限信息
2. `/form/config/{formId}/{hash}.json` - 表单配置 JSON，包含完整的字段定义

## Schema 结构

```json
{
  "formId": "mk_model_xxx",
  "formName": "表单名称",
  "url": "https://xxx",
  "fields": [ /* 主表字段 */ ],
  "generatedAt": "2026-05-06T10:00:00.000Z",
  "detailTables": [ /* 明细表列表 */ ]
}
```

### 主表字段结构 (FormField)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 字段ID，如 `fd_name` |
| fdType | string | 字段类型，如 `fd_input`, `relation`, `cfg` |
| label | string | 字段显示名称（可能需要处理多语言） |
| required | boolean | 是否必填（从 auth 获取） |
| options | FieldOption[] | 选项列表（单选、多选、下拉等） |
| renderMode | string | 渲染模式：`singlelist`, `mullist`, `radio`, `checkbox`, `select`, `multiSelect` |
| cfgId | string | 基础数据字段的 enumId（用于动态获取选项） |
| cfgConfig | object | 基础数据字段的完整配置信息 |
| relationCfg | object | 业务关联字段的完整配置信息（包含数据请求配置） |
| sourceComponent | string | 源码组件标识，如 `@elem/xform-relation~hash` |
| methods | string[] | 组件支持的事件，如 `['onChange']` |

### 明细表结构 (DetailTableSchema)

```json
{
  "detailModelId": "mk_model_xxx_d_xxx",
  "detailTableName": "明细表1",
  "fields": [ /* 明细表字段，结构同主表 */ ]
}
```

## 字段类型映射

后端返回的 fdType 需要映射为前端 Filler 能识别的类型：

| 后端类型 | 映射后类型 | 说明 |
|----------|------------|------|
| text / varchar | fd_input | 单行文本 |
| textarea | textarea | 多行文本 |
| number | numbertext | 数值 |
| moneytext | moneytext | 金额 |
| radio | radio | 单选 |
| checkbox | checkbox | 多选 |
| select | select | 下拉单选 |
| select (renderMode=mullist/mulselect) | select~multi | 下拉多选 |
| timestamp | timestamp | 日期时间 |
| timepicker | timepicker | 时间 |
| agency | cfg | 基础数据 |
| relation | relation | 业务关联 |
| relation (renderMode=mullist/checkbox/mulselect) | relation~multi | 业务关联多选 |
| address | address | 地址本 |
| calculate | calculate | 前端计算 |
| switch | switch | 开关 |

## 关键配置提取

### 1. auth - 权限信息

auth 包含新建/编辑/查看三种场景的字段权限：

```json
{
  "auth": [{
    "add": {
      "表名": {
        "fields": {
          "fd_name": { "required": true, "editable": true, "visible": true },
          "fd_gender": { "required": false, "editable": true, "visible": true }
        }
      }
    }
  }]
}
```

**必填状态从 auth.add.fields.{字段名}.required 获取**，这是最准确的必填判断方式。

### 2. cfgConfig - 基础数据配置

基础数据字段的配置存储在 `fdAttribute` 或 `fdFontExtendData` 中：

```json
{
  "fdAttribute": {
    "cfgId": "sys-org-person",
    "cfgName": "人员选择",
    "modelId": "xxx",
    "fdId": "xxx"
  }
}
```

### 3. relationCfg - 业务关联配置

业务关联字段的配置存储在 `fdAttribute` 或 `fdFontExtendData` 中：

```json
{
  "fdAttribute": {
    "relationCfg": {
      "modelId": "关联模型ID",
      "relationName": "关联名称",
      "formName": "表单名"
    }
  }
}
```

### 4. sourceComponent - 源码组件

**获取方式**：通过 MKXFORM 全局对象获取组件类型

```typescript
const sourceComponent = MKXFORM.$(fieldId)._CURRENT_FIBRE.props.type;
// 示例: "@elem/xform-relation~6kodhk"
```

组件类型格式：`@elem/xform-{组件名}~{hash}`，其中 hash 是组件实例的唯一标识。

## 渲染模式 (renderMode)

业务关联和基础数据字段通过 renderMode 区分单选/多选：

| renderMode | 类型 | 说明 |
|------------|------|------|
| singlelist | relation / cfg | 单选列表 |
| mullist | relation~multi / cfg~multi | 多选列表 |
| radio | relation / cfg | 单选框 |
| checkbox | relation~multi / cfg~multi | 多选框 |
| select | relation / cfg | 单选下拉 |
| multiSelect | relation~multi / cfg~multi | 多选下拉 |

## 跳过的字段

以下系统字段和布局字段不纳入 Schema：

### 系统字段
- fd_id, fd_create_time, fd_last_modified_time
- fd_creator, fd_creator_dept, fd_owner, fd_owner_dept
- fd_alter, fd_alter_time, fd_deleted, fd_published_time
- fd_doc_status, fd_doc_subject, fd_template, fd_xform_id
- fd_version, fd_entity_id, fd_entity_name, fd_module
- fd_main_id, fd_order, fd_att_nocopy, fd_att_no_print
- fd_att_no_download, fd_draft_no_edit_copys, fd_draft_no_edit_download, fd_draft_no_edit_prints

### 布局字段
- dividing, desc, multi-header, hidden, boolean

## MKXFORM 全局对象

页面加载后可以通过 `window.MKXFORM` 访问表单实例：

```typescript
// 获取字段实例
const cmp = MKXFORM.$(fieldId);
const fibre = cmp?._CURRENT_FIBRE;
const props = fibre?.props;

// 获取字段值
MKXFORM.$(fieldId).getValue();

// 设置字段值
MKXFORM.$(fieldId).setValue(value);

// 获取 dataModels（字段定义）
MKXFORM.dataModels;

// 获取视图状态（新建/编辑/查看）
MKXFORM.viewStatus;
```

## 相关文件

- SchemaGenerator: `src/schema/SchemaGenerator.ts`
- FillerFactory: `src/filler/FillerFactory.ts`
- RelationFiller: `src/filler/RelationFiller.ts`
- CfgFiller: `src/filler/CfgFiller.ts`

## 相关仓库

- 表单引擎：`/Users/xiex/Documents/GIT/MK/sys-xform`
- 表单组件：`/Users/xiex/Documents/GIT/MK/element/el-form`
- UI组件：`/Users/xiex/Documents/GIT/MK/element/sys-ui`
- 地址本相关：`/Users/xiex/Documents/GIT/MK/sys-org`
