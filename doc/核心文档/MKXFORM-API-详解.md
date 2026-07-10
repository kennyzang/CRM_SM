# MKXFORM API 详解

> MKXFORM 是 EasyCraft/SP3Test 表单系统的核心全局对象，提供直接操作表单组件的能力。
> 通过 MKXFORM API，可以绕过 UI 点击直接设置字段值，是 Schema-Driven 测试框架的关键支撑。

## 1. 核心定位

| 特性 | 说明 |
|------|------|
| 全局对象 | `window.MKXFORM` |
| 出现环境 | SP3Test、EasyCraft 表单页面 |
| 核心价值 | **绕过 UI 点击直接设置值**，解决复杂组件填充问题 |
| 依赖基础 | React Fiber（`_CURRENT_FIBRE`） |

## 2. MKXFORM 完整方法列表

### 2.1 核心 API 方法

```typescript
// 组件操作
MKXFORM.$(fieldId: string)                    // 获取组件实例
MKXFORM.setValue(fieldId: string, value: unknown)  // 设置字段值
MKXFORM.getControlValue(fieldId: string)      // 获取控件值
MKXFORM.getValueText(fieldId: string)          // 获取显示文本

// 表单级操作
MKXFORM.validateFields()                       // 校验所有字段
MKXFORM.getFormValues()                       // 获取所有表单值
MKXFORM.getPageControlValue()                 // 获取页面控件值
MKXFORM.updateControl(fieldId, props)          // 更新控件属性
MKXFORM.updateControlStyle(fieldId, style)     // 更新控件样式

// 字段属性操作
MKXFORM.getFieldAttr(fieldId, attrName)        // 获取字段属性
MKXFORM.setFieldAttr(fieldId, attrName, value) // 设置字段属性

// 明细表操作
MKXFORM.addRow(detailTableId)                  // 添加行
MKXFORM.updateRow(detailTableId, rowIndex, data) // 更新行
MKXFORM.deleteRow(detailTableId, rowIndex)     // 删除行
MKXFORM.getRowCount(detailTableId)             // 获取行数
MKXFORM.getSelectedRowIndex(detailTableId)     // 获取选中行索引
MKXFORM.checkDetailRow(detailTableId, rowIndex) // 选中行
MKXFORM.controlDetailRowCanDelete(detailTableId, rowIndex) // 检查能否删除
MKXFORM.setDetailFieldAttr(detailTableId, rowIndex, fieldId, attr, value) // 设置明细字段属性
MKXFORM.setDetailRowAttr(detailTableId, rowIndex, attr, value) // 设置明细行属性
MKXFORM.setDetailFieldItemAttr(detailTableId, rowIndex, fieldId, itemIndex, attr, value) // 设置明细字段项属性

// 回调钩子
MKXFORM.onChange(fieldId, callback)            // 值变化回调
MKXFORM.beforeSubmit(callback)                 // 提交前回调
MKXFORM.afterSubmit(callback)                  // 提交后回调

// 样式操作
MKXFORM.setStyle(fieldId, style)               // 设置样式
MKXFORM.setProps(fieldId, props)               // 设置属性
```

### 2.2 工具方法

```typescript
// 业务操作
MKXFORM.executeOperation(operation)             // 执行操作
MKXFORM.authOperation(operation)               // 权限操作
MKXFORM.callTic(params)                        // 调用 TIC
MKXFORM.callLbpm(params)                       // 调用 LBPM
MKXFORM.callOrg(params)                        // 调用组织架构
MKXFORM.callFlow(params)                       // 调用流程

// UI 交互
MKXFORM.toast(message, type)                   // 消息提示
MKXFORM.modal(options)                         // 模态框
MKXFORM.mobileModal(options)                   // 移动端模态框
MKXFORM.tableModal(options)                    // 表格模态框
MKXFORM.HTMLModal(options)                     // HTML 模态框

// 其他
MKXFORM.ajax(options)                          // AJAX 请求
MKXFORM.getLocale()                            // 获取本地化
MKXFORM.reload()                               // 刷新页面
```

### 2.3 属性列表

```typescript
MKXFORM.formId                 // 表单 ID
MKXFORM.formSizeType          // 表单尺寸类型
MKXFORM.docStatus             // 文档状态
MKXFORM.processInstanceId     // 流程实例 ID
MKXFORM.platform              // 平台标识
MKXFORM.dataModels            // 数据模型
MKXFORM.businessFieldsValue    // 业务字段值
MKXFORM.$$FORM                // 表单实例
MKXFORM.$$LBPM                // LBPM 实例
MKXFORM.$$DETAILFORMS         // 明细表集合
MKXFORM.$$CONTROLREF          // 控件引用
MKXFORM.popupOnOk             // 弹窗确认回调
MKXFORM.popupOnCancel         // 弹窗取消回调
MKXFORM.MKXFORM_DATA_CONTAINER // 数据容器
```

## 3. 组件实例结构

### 3.1 通过 `MKXFORM.$(fieldId)` 获取组件

```typescript
interface MKXFORMComponent {
  _CURRENT_FIBRE: FiberNode;           // React Fiber 节点
  _SIMPLE_CURRENT_FIBRE: SimpleFiber; // 简化 Fiber 节点
  _formatItemConfig(config): void;
  _findSimpleConfigForParent(parent): config;
  remove(): void;
  append(child): void;
  insert(index, child): void;
  parent: MKXFORMComponent;
  children: MKXFORMComponent[];
  getSelf(): MKXFORMComponent;
}

interface FiberNode {
  kind: string;                       // 组件类型
  type: string;                        // HTML 类型或组件名
  name: string;                        // 字段名
  label: LabelInfo;                    // 标签信息
  props: ComponentProps;              // React Props
  childrenGroup: ChildrenGroup[];    // 子组件组
  hidden: boolean;                     // 是否隐藏
  hiddenInvalid: boolean;              // 隐藏校验
  validateRules: ValidationRule[];    // 校验规则
  parent: FiberNode;                   // 父节点
}

interface ComponentProps {
  // 基础属性
  id: string;                          // 字段 ID
  name: string;                        // 字段名
  key: string;                         // React key
  type: string;                        // 组件类型
  value: unknown;                      // 当前值
  label: LabelInfo | string;           // 标签
  title: string;                       // 标题

  // 渲染属性
  renderMode: string;                   // 渲染模式
  placeholder: string;                 // 占位符
  layout: string;                       // 布局
  span: number;                         // 跨度

  // 业务属性
  options?: Option[];                  // 选项列表
  cfg?: CfgConfig;                     // 基础数据配置
  modelName?: string;                   // 模型名

  // 回调
  onChange?: (value: unknown, option?: unknown) => void;  // 值变化回调
  onBlur?: () => void;                  // 失焦回调
  ref?: React.Ref;                      // React ref

  // 状态
  disabled?: boolean;                   // 是否禁用
  readonly?: boolean;                  // 是否只读
  showStatus?: string;                  // 显示状态
}
```

## 4. 字段类型与 renderMode

### 4.1 基础数据 (cfg)

| renderMode | 说明 | onChange 参数格式 |
|------------|------|------------------|
| `radio` | 单选框 | `fdId` (如 `"1"`) |
| `checkbox` | 多选框 | `[{ fdId, fdName }]` |
| `select` | 单选下拉 | `{ fdId, fdName }` |
| `mulselect` | 多选下拉 | `[{ fdId, fdName }, ...]` |
| `singlelist` | 单行列表 | `{ fdId, fdName }` |
| `mullist` | 多行列表 | `[{ fdId, fdName }, ...]` |

### 4.2 业务关联 (relation)

| renderMode | 说明 | onChange 参数格式 |
|------------|------|------------------|
| `radio` | 单选框 | `{ fdId, fdName }` |
| `checkbox` | 多选框 | `[{ fdId, fdName }]` |
| `singlelist` | 单选列表 | `{ fdId, fdName }` |
| `mullist` | 多选列表 | `[{ fdId, fdName }, ...]` |
| `multiSelect` | 多选下拉 | `{ fdId, fdName }` |

### 4.3 其他组件

| 组件类型 | renderMode | 说明 |
|----------|------------|------|
| `fd_input` | `input` | 单行文本 |
| `textarea` | `textarea` | 多行文本 |
| `timestamp` | `datepicker` | 日期选择 |
| `timepicker` | `timepicker` | 时间选择 |
| `numbertext` | `number` | 数值 |
| `moneytext` | `money` | 金额 |

## 5. setValueViaMKXFORM 实现详解

### 5.1 核心实现代码

```typescript
/**
 * 通过 MKXFORM API 直接设置基础数据字段的值
 *
 * 原理：通过 React Fiber 的 onChange 回调直接设置值，绕过 UI 点击
 * 验证结果显示此方法可以成功设置值并同步 DOM 显示
 */
private async setValueViaMKXFORM(): Promise<boolean> {
  const { field } = this.context;

  try {
    const result = await this.context.page.evaluate(
      ({ fieldId, fdType }: { fieldId: string; fdType: string }) => {
        // @ts-ignore
        const cmp = window.MKXFORM?.$(fieldId);
        if (!cmp) {
          return { success: false, reason: 'Component not found in MKXFORM' };
        }

        const fibre = cmp._CURRENT_FIBRE;
        if (!fibre) {
          return { success: false, reason: 'No _CURRENT_FIBRE' };
        }

        const props = fibre.props;
        if (!props) {
          return { success: false, reason: 'No props in fibre' };
        }

        if (typeof props.onChange !== 'function') {
          return { success: false, reason: 'No onChange function' };
        }

        const options = props.options || [];
        if (options.length === 0) {
          return { success: false, reason: 'No options available' };
        }

        // 随机选择一个选项
        const randomIndex = Math.floor(Math.random() * options.length);
        const option = options[randomIndex];
        if (!option) {
          return { success: false, reason: 'Option not found' };
        }

        const renderMode = props.renderMode;
        const isMulti = fdType === 'cfg~multi' || (renderMode && renderMode.startsWith('mul'));

        // 根据 renderMode 确定 onChange 参数格式
        let valueToSet: unknown;
        switch (renderMode) {
          case 'radio':
            // radio 直接传 fdId 值
            valueToSet = option.fdId;
            break;
          case 'mulselect':
            // 多选传入数组
            valueToSet = [{ fdId: option.fdId, fdName: option.fdName }];
            break;
          case 'checkbox':
            // checkbox 多选，传入数组
            valueToSet = [{ fdId: option.fdId, fdName: option.fdName }];
            break;
          default:
            // singlelist, select: 传入对象
            valueToSet = { fdId: option.fdId, fdName: option.fdName };
        }

        // 调用 onChange 设置值
        props.onChange(valueToSet);

        return {
          success: true,
          renderMode,
          selectedOption: { label: option.fdName, value: option.fdId },
          newValue: props.value
        };
      },
      { fieldId: field.id, fdType: field.fdType }
    );

    if (result.success) {
      console.log(`[CfgFiller] MKXFORM: Set "${result.selectedOption?.label}" (${result.selectedOption?.value}) for "${field.label}" via ${result.renderMode}`);
      return true;
    } else {
      console.log(`[CfgFiller] MKXFORM: Failed - ${result.reason}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[CfgFiller] MKXFORM: Exception - ${errorMessage}`);
    return false;
  }
}
```

### 5.2 调用流程图

```
CfgFiller.fill()
    ↓
fillForSP3Test() 或 fillForEasyCraft()
    ↓
setValueViaMKXFORM()  ← 优先调用
    ↓
page.evaluate(
    MKXFORM.$(fieldId)           // 获取组件
        ↓
    _CURRENT_FIBRE.props          // 获取 props
        ↓
    props.onChange(value)         // 直接调用 onChange
        ↓
    返回 { success, reason }
)
    ↓
成功 → 返回 true，字段已填充
失败 → 返回 false，fallback 到 UI 点击
```

## 6. 测试验证结果

### 6.1 SP3Test 环境测试结果

| 字段类型 | renderMode | MKXFORM setValue | 状态 |
|----------|------------|------------------|------|
| 基础数据-单行列表框 | `singlelist` | ✅ 成功 | `{ fdId, fdName }` |
| 基础数据-多选列表 | `mullist` | ✅ 成功 | `[{ fdId, fdName }]` |
| 基础数据-单选框 | `radio` | ✅ 成功 | `fdId` |
| 基础数据-多选款 | `checkbox` | ✅ 成功 | `[{ fdId, fdName }]` |
| 基础数据-单选下拉 | `select` | ✅ 成功 | `{ fdId, fdName }` |
| 基础数据-多选下拉 | `mulselect` | ⚠️ 失败 | 组件未初始化 |

### 6.2 验证命令

```typescript
// 在浏览器控制台执行
const mkxform = window.MKXFORM;
const cmp = mkxform.$('fd_test1');  // singlelist 组件
const fibre = cmp._CURRENT_FIBRE;

// 查看组件属性
console.log('renderMode:', fibre.props.renderMode);
console.log('options:', fibre.props.options);
console.log('value:', fibre.props.value);

// 直接设置值
fibre.props.onChange({ fdId: '1', fdName: '选项1' });
```

## 7. 应用场景

### 7.1 优势场景

1. **复杂下拉组件**：选项动态加载、搜索过滤
2. **级联选择器**：多级联动、异步加载
3. **业务关联**：弹窗选择、数据量大
4. **只读/禁用状态**：正常 UI 无法点击

### 7.2 限制场景

1. **组件未初始化**：`MKXFORM.$(fieldId)` 返回 null
2. **无 onChange 回调**：某些只读字段
3. **需要 UI 副作用**：如联动其他字段、触发验证

### 7.3 Fallback 策略

```typescript
// 优先使用 MKXFORM
const mkxformSuccess = await this.setValueViaMKXFORM();
if (mkxformSuccess) {
  return;  // 成功则返回
}

// 回退到 UI 点击
await this.fillByUIClick();
```

## 8. 与传统填充方式对比

| 方式 | 原理 | 速度 | 可靠性 | 适用场景 |
|------|------|------|--------|----------|
| **MKXFORM.setValue** | 直接调用 React onChange | ⚡ 极快 | ⚠️ 依赖组件已初始化 | 所有场景 |
| **UI 点击** | 模拟用户点击 | 🐢 慢 | ✅ 普适 | 基础字段 |
| **Page.evaluate** | 执行 JS 直接操作 DOM | ⚡ 快 | ⚠️ 可能不同步状态 | 简单字段 |

## 9. 明细表 MKXFORM API 实现

### 9.1 明细表字段 ID 格式

**关键发现**：明细表字段需要使用完整的 `{tableId}.{fieldId}` 格式，而不是简单的 `fieldId`。

```typescript
// ✅ 正确格式：明细表 ID + 字段 ID
const fullFieldId = 'mk_test1_d_test_fd1.fd_name';

// ❌ 错误格式：只使用字段 ID
const wrongFieldId = 'fd_name';

// 获取明细表组件实例
const cmp = MKXFORM.$(fullFieldId);
```

### 9.2 明细表核心 API（从 sys-xform 表单引擎学习）

| API | 功能 | 说明 |
|-----|------|------|
| `MKXFORM.getRowCount(detailTableId)` | 获取明细表行数 | 返回当前行数，0 表示无数据行 |
| `MKXFORM.addRow(detailTableId, rowValue?)` | 新增行 | 可选传入初始行数据 |
| `MKXFORM.updateControl(fieldId, rowNum, value)` | 更新指定控件值 | 直接设置单元格值 |
| `MKXFORM.deleteRow(detailTableId, rowIndex)` | 删除指定行 | 通过行索引删除 |

### 9.3 明细表操作最佳实践

**核心流程**：先判断明细表的行数，为0需要新增一行，再填充数据。

```typescript
// 1. 获取明细表行数
const rowCount = MKXFORM.getRowCount('mk_model_xxx_d_xxx');

// 2. 如果没有行，先新增一行
if (rowCount === 0) {
  MKXFORM.addRow('mk_model_xxx_d_xxx');
}

// 3. 更新指定行的字段值
// 注意：字段ID格式为 {detailTableId}.{fieldId}
MKXFORM.updateControl('mk_model_xxx_d_xxx.fd_name', 0, '测试值');
MKXFORM.updateControl('mk_model_xxx_d_xxx.fd_amount', 0, 100);
```

### 9.4 DetailTableBuilder 中的实现

```typescript
// src/core/DetailTableBuilder.ts

/**
 * 通过 MKXFORM API 获取明细表行数
 */
async getRowCountViaMKXFORM(): Promise<number> {
  return this.page.evaluate((detailModelId) => {
    return window.MKXFORM?.getRowCount?.(detailModelId) || 0;
  }, this.config.detailModelId);
}

/**
 * 通过 MKXFORM API 新增一行
 */
async addRowViaMKXFORM(rowValue?: Record<string, unknown>): Promise<void> {
  await this.page.evaluate(
    ({ detailModelId, rowValue }) => {
      window.MKXFORM?.addRow?.(detailModelId, rowValue);
    },
    { detailModelId: this.config.detailModelId, rowValue }
  );
}

/**
 * 通过 MKXFORM API 更新指定控件值
 * @param fieldId 字段ID（格式：{detailTableId}.{fieldId}）
 * @param rowNum 行索引（从0开始）
 * @param value 要设置的值
 */
async updateControlViaMKXFORM(fieldId: string, rowNum: number, value: unknown): Promise<boolean> {
  return this.page.evaluate(
    ({ fieldId, rowNum, value }) => {
      // @ts-ignore
      window.MKXFORM?.updateControl?.(fieldId, rowNum, value);
      return true;
    },
    { fieldId, rowNum, value }
  );
}

/**
 * 添加并使用自定义数据填充一行
 * 先判断明细表的行数，为0需要新增一行，再填充数据
 */
async addAndFillRowWithData(data: RowData): Promise<void> {
  // 获取当前行数
  const currentRowCount = await this.getRowCountViaMKXFORM();
  
  // 如果当前没有行，先添加一行
  if (currentRowCount === 0) {
    await this.addRowViaMKXFORM();
    await this.page.waitForTimeout(500);
  }
  
  // 获取目标行索引
  const newRowCount = await this.getRowCountViaMKXFORM();
  const targetRowIndex = newRowCount - 1;
  
  // 填充数据
  await this.fillRowWithData(targetRowIndex, data);
}
```

### 9.5 fillRowWithData 中的 MKXFORM 调用

```typescript
// 构建完整的字段标识符（格式：{detailModelId}.{fieldId}）
const fullFieldId = `${this.config.detailModelId}.${fid}`;

// 优先尝试使用 MKXFORM updateControl API（推荐方式）
const mkxformSuccess = await this.updateControlViaMKXFORM(fullFieldId, rowIndex, value);
```

### 9.6 明细表填充成功验证

| 字段类型 | 填充方式 | 状态 |
|----------|---------|------|
| 单行文本 (fd_input) | MKXFORM.updateControl | ✅ 成功 |
| 多行文本 (textarea) | MKXFORM.updateControl | ✅ 成功 |
| 数值 (numbertext) | MKXFORM.updateControl | ✅ 成功 |
| 金额 (moneytext) | MKXFORM.updateControl | ✅ 成功 |
| 日期 (timestamp) | MKXFORM.updateControl | ✅ 成功 |
| 时间 (timepicker) | MKXFORM.updateControl | ✅ 成功 |
| 单选框 (radio) | MKXFORM.updateControl | ✅ 成功 |
| 多选框 (checkbox) | MKXFORM.updateControl | ✅ 成功 |
| 下拉选择 (select) | MKXFORM.updateControl | ✅ 成功 |
| 基础数据 (cfg) | MKXFORM.updateControl | ✅ 成功 |

### 9.7 明细表操作流程图

```
addAndFillRowWithData(data)
    ↓
getRowCountViaMKXFORM()         // 获取当前行数
    ↓
判断行数是否为0
    ↓ 是
addRowViaMKXFORM()              // 新增一行
    ↓
getRowCountViaMKXFORM()         // 获取新行数
    ↓
fillRowWithData(rowIndex, data) // 填充数据
    ↓
updateControlViaMKXFORM()       // 逐个字段设置值
    ↓
填充完成
```

## 10. 所有 Filler 的 MKXFORM 实现

### 10.1 已实现 MKXFORM 支持的 Filler

| Filler 类 | fdType | MKXFORM 支持 | 回退 UI |
|-----------|--------|-------------|--------|
| FdInputFiller | `fd_input` | ✅ | ✅ |
| TextareaFiller | `textarea` | ✅ | ✅ |
| RadioFiller | `radio` | ✅ | ✅ |
| CheckboxFiller | `checkbox` | ✅ | ✅ |
| SelectFiller | `select`, `select~multi` | ✅ | ✅ |
| TimestampFiller | `timestamp` | ✅ | ✅ |
| TimepickerFiller | `timepicker` | ✅ | ✅ |
| NumbertextFiller | `numbertext` | ✅ | ✅ |
| MoneytextFiller | `moneytext` | ✅ | ✅ |
| CfgFiller | `cfg`, `cfg~multi` | ✅ | ✅ |
| RelationFiller | `relation` | ✅ | ✅ |

### 10.2 统一的 MKXFORM 调用模式

所有 Filler 都遵循相同的模式：

```typescript
class XXXFiller extends BaseFiller {
  async fill(): Promise<void> {
    // 1. 优先尝试 MKXFORM API
    const mkxformSuccess = await this.setValueViaMKXFORM();
    if (mkxformSuccess) {
      console.log(`[XXXFiller] MKXFORM: Successfully set value`);
      return;
    }
    
    // 2. 回退到 UI 填充方式
    console.log(`[XXXFiller] MKXFORM failed, fallback to UI`);
    await this.fillViaUI();
  }
  
  private async setValueViaMKXFORM(): Promise<boolean> {
    try {
      const result = await this.context.page.evaluate(
        ({ fieldId }) => {
          const cmp = window.MKXFORM?.(fieldId);
          if (!cmp) return { success: false, reason: 'Component not found' };
          
          const fibre = cmp._CURRENT_FIBRE;
          if (!fibre?.props?.onChange) {
            return { success: false, reason: 'No onChange function' };
          }
          
          // 生成值并调用 onChange
          const value = generateRandomValue();
          fibre.props.onChange(value);
          
          return { success: true, value };
        },
        { fieldId: this.context.field.id }
      );
      
      return result.success;
    } catch (error) {
      console.warn(`[XXXFiller] MKXFORM error: ${error}`);
      return false;
    }
  }
}
```

## 11. 未来扩展方向

### 11.1 扩展 MKXFORM 能力

```typescript
// 1. 支持校验触发
MKXFORM.validateFields();
const isValid = MKXFORM.validateFields();
if (!isValid) {
  // 获取错误信息
  const errors = MKXFORM.validateFields();
}

// 2. 支持批量设置值
MKXFORM.setValues({
  fd_name: '测试',
  fd_amount: 100,
  fd_date: '2026-05-01'
});
```

### 11.2 集成到 FillerFactory

```typescript
// 在 FillerFactory 中注册 MKXFORM 填充器
FillerFactory.register('cfg', MKXFORMCfgFiller);
FillerFactory.register('relation', MKXFORMRelationFiller);

// MKXFORMCfgFiller 优先使用 MKXFORM，失败后 fallback 到 UICfgFiller
```

## 10. 附录：完整方法签名

### 10.1 核心方法

```typescript
// 获取组件实例
$(fieldId: string): MKXFORMComponent | null

// 设置值（推荐）
setValue(fieldId: string, value: unknown): void

// 获取值
getControlValue(fieldId: string): unknown
getValueText(fieldId: string): string

// 校验
validateFields(): ValidationResult

// 表单级
getFormValues(): FormValues
getPageControlValue(): PageControlValue

// 更新控件
updateControl(fieldId: string, props: Record<string, unknown>): void
updateControlStyle(fieldId: string, style: Record<string, unknown>): void

// 属性操作
getFieldAttr(fieldId: string, attrName: string): unknown
setFieldAttr(fieldId: string, attrName: string, value: unknown): void
```

### 10.2 明细表方法

```typescript
addRow(detailTableId: string): number
updateRow(detailTableId: string, rowIndex: number, data: Record<string, unknown>): void
deleteRow(detailTableId: string, rowIndex: number): void
getRowCount(detailTableId: string): number
getSelectedRowIndex(detailTableId: string): number
checkDetailRow(detailTableId: string, rowIndex: number): void
controlDetailRowCanDelete(detailTableId: string, rowIndex: number): boolean
setDetailFieldAttr(detailTableId: string, rowIndex: number, fieldId: string, attr: string, value: unknown): void
setDetailRowAttr(detailTableId: string, rowIndex: number, attr: string, value: unknown): void
setDetailFieldItemAttr(detailTableId: string, rowIndex: number, fieldId: string, itemIndex: number, attr: string, value: unknown): void
```

---

**文档版本**: 1.0.0
**更新日期**: 2026-05-01
**来源**: 基于 SP3Test 环境实际探查
