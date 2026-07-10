# MKXFORM API 快速参考

> **全局对象**: `window.MKXFORM`
>
> **适用环境**: SP3Test、EasyCraft 表单页面

---

## 一、核心 API

| 方法 | 用途 | 参数 | 返回值 |
|------|------|------|--------|
| `$(fieldId)` | 获取组件实例 | `fieldId: string` | 组件实例 |
| `setValue(fieldId, value)` | 设置字段值 | `fieldId: string, value: unknown` | `void` |
| `getControlValue(fieldId)` | 获取控件值 | `fieldId: string` | `unknown` |
| `getValueText(fieldId)` | 获取显示文本 | `fieldId: string` | `string` |
| `updateControl(fieldId, props)` | 更新控件属性 | `fieldId: string, props: object` | `void` |

---

## 二、表单级操作

| 方法 | 用途 |
|------|------|
| `validateFields()` | 校验所有字段 |
| `getFormValues()` | 获取所有表单值 |
| `getPageControlValue()` | 获取页面控件值 |
| `updateControlStyle(fieldId, style)` | 更新控件样式 |

---

## 三、明细表操作

| 方法 | 用途 | 参数 |
|------|------|------|
| `addRow(detailTableId)` | 添加行 | `detailTableId: string` |
| `updateRow(detailTableId, rowIndex, data)` | 更新行 | `detailTableId, rowIndex: number, data: object` |
| `deleteRow(detailTableId, rowIndex)` | 删除行 | `detailTableId, rowIndex: number` |
| `getRowCount(detailTableId)` | 获取行数 | `detailTableId: string` |
| `updateControl(fieldId, rowIndex, value)` | 设置明细表字段值 | `fieldId: string, rowIndex: number, value: unknown` |

---

## 四、字段属性操作

| 方法 | 用途 |
|------|------|
| `getFieldAttr(fieldId, attrName)` | 获取字段属性 |
| `setFieldAttr(fieldId, attrName, value)` | 设置字段属性 |

---

## 五、回调钩子

| 方法 | 用途 |
|------|------|
| `onChange(fieldId, callback)` | 值变化回调 |
| `beforeSubmit(callback)` | 提交前回调 |
| `afterSubmit(callback)` | 提交后回调 |

---

## 六、常用代码片段

### 6.1 主表字段设置值

```typescript
// 单行文本
MKXFORM.setValue('mk_model_xxx.fd_name', '测试值');

// 日期（时间戳）
MKXFORM.setValue('mk_model_xxx.fd_date', Date.now());

// 基础数据
MKXFORM.setValue('mk_model_xxx.fd_cfg', [{ fdId: '1', fdName: '选项1' }]);
```

### 6.2 明细表字段设置值

```typescript
// 设置明细表第 0 行的字段值
MKXFORM.updateControl('mk_model_xxx_d_xxx.fd_name', 0, '测试值');

// 添加行
MKXFORM.addRow('mk_model_xxx_d_xxx');

// 获取行数
const count = MKXFORM.getRowCount('mk_model_xxx_d_xxx');
```

### 6.3 获取组件属性

```typescript
// 获取组件实例
const cmp = MKXFORM.$('mk_model_xxx.fd_name');

// 获取组件属性
const props = cmp._CURRENT_FIBRE.props;

// 调用 onChange
props.onChange('新值');
```

---

## 七、字段标识格式

| 场景 | 格式 | 示例 |
|------|------|------|
| 主表字段 | `{formId}.{fieldId}` | `mk_model_xxx.fd_name` |
| 明细表字段 | `{detailTableId}.{fieldId}` | `mk_model_xxx_d_xxx.fd_name` |

---

## 参考

- 详细说明：[MKXFORM-API-详解.md](MKXFORM-API-详解.md)
