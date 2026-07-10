import { faker, Faker, zh_CN } from '@faker-js/faker';

/**
 * 数据生成工具类
 * 使用 faker.js 生成随机但真实的数据
 */
const fakerZh = new Faker({ locale: [zh_CN] });

export class DataGenerator {
  /**
   * 根据字段标签智能生成数据
   * @param label 字段标签名称
   * @param fdType 字段类型（可选，用于辅助判断）
   * @returns 生成的随机数据
   */
  static generateByLabel(label: string, fdType?: string): string | number | string[] {
    const lowerLabel = label.toLowerCase();

    if (/姓名|name/i.test(label)) {
      return this.generateName();
    }
    if (/备注|note|说明|comment/i.test(label)) {
      return this.generateNote();
    }
    if (/金额|money|salary|工资|薪酬/i.test(label)) {
      return this.generateMoney();
    }
    if (/手机|tel|phone/i.test(label)) {
      return this.generatePhone();
    }
    if (/邮箱|email/i.test(label)) {
      return this.generateEmail();
    }
    if (/地址|address|location/i.test(label)) {
      return this.generateAddress();
    }
    if (/公司|enterprise|organization/i.test(label)) {
      return this.generateCompany();
    }
    if (/部门|department|dept/i.test(label)) {
      return this.generateDepartment();
    }
    if (/工号|no|code|num/i.test(label)) {
      return this.generateCode();
    }
    if (/职位|post|job|title/i.test(label)) {
      return this.generatePost();
    }
    if (/爱好|interest|hobby/i.test(label)) {
      return this.generateInterest();
    }
    if (/日期|date|birth|生日/i.test(label)) {
      return this.generateDate();
    }
    if (/时间|time|时刻/i.test(label)) {
      return this.generateTimeStr();
    }
    if (/性别|gender|sex/i.test(label)) {
      return this.generateGender();
    }
    if (/描述|desc|summary/i.test(label)) {
      return this.generateDescription();
    }
    if (/编号|serial/i.test(label)) {
      return this.generateSerial();
    }
    if (/数量|qty|count|num|数目/i.test(label)) {
      return this.generateNumber(1, 100);
    }
    if (/价格|price|cost/i.test(label)) {
      return this.generateMoney();
    }
    if (/标题|title|subject/i.test(label)) {
      return this.generateTitle();
    }
    if (/内容|content|body/i.test(label)) {
      return this.generateContent();
    }

    // 默认：根据 fdType 生成
    if (fdType) {
      return this.generateByFdType(fdType);
    }

    // 完全无法判断时返回默认文本
    return this.generateDefaultText();
  }

  /**
   * 根据 fdType 生成默认数据
   */
  static generateByFdType(fdType: string): string | number | string[] {
    switch (fdType) {
      case 'fd_input':
      case 'textarea':
        return this.generateDefaultText();
      case 'numbertext':
        return this.generateNumber(1, 1000);
      case 'moneytext':
        return this.generateMoney();
      case 'timestamp':
        return this.generateDate();
      case 'timepicker':
        return this.generateTimeStr();
      case 'radio':
        return '1';
      case 'checkbox':
        return ['1', '2'];
      case 'select':
        return '1';
      case 'select~multi':
        return ['1', '2'];
      default:
        return this.generateDefaultText();
    }
  }
  /**
   * 生成随机中文姓名
   */
  static generateName(): string {
    return `${fakerZh.person.lastName()}${fakerZh.person.firstName()}`;
  }

  /**
   * 生成随机金额
   */
  static generateMoney(): number {
    return fakerZh.number.int({ min: 100, max: 100000 });
  }

  /**
   * 生成随机手机号（中国）
   */
  static generatePhone(): string {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
      '150', '151', '152', '153', '155', '156', '157', '158', '159',
      '170', '171', '172', '173', '175', '176', '177', '178',
      '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
    const prefix = prefixes[fakerZh.number.int({ min: 0, max: prefixes.length - 1 })];
    const suffix = fakerZh.number.int({ min: 10000000, max: 99999999 }).toString();
    return `${prefix}${suffix}`;
  }

  /**
   * 生成随机邮箱
   */
  static generateEmail(): string {
    return fakerZh.internet.email().toLowerCase();
  }

  /**
   * 生成随机地址（中文）
   */
  static generateAddress(): string {
    return `${fakerZh.location.state()}省${fakerZh.location.city()}市${fakerZh.location.street()}`;
  }

  /**
   * 生成随机公司名
   */
  static generateCompany(): string {
    const suffixes = ['科技有限公司', '有限责任公司', '股份有限公司', '集团有限公司', '投资发展有限公司'];
    const name = fakerZh.company.name();
    return `${name}${suffixes[fakerZh.number.int({ min: 0, max: suffixes.length - 1 })]}`;
  }

  /**
   * 生成随机部门名
   */
  static generateDepartment(): string {
    const departments = ['研发部', '市场部', '销售部', '人力资源部', '财务部', '行政部', '技术部', '产品部', '运营部', '客服部'];
    return departments[fakerZh.number.int({ min: 0, max: departments.length - 1 })];
  }

  /**
   * 生成随机工号
   */
  static generateCode(): string {
    return `EMP${fakerZh.number.int({ min: 10000, max: 99999 })}`;
  }

  /**
   * 生成随机日期字符串（YYYY-MM-DD）
   */
  static generateDate(): string {
    const date = fakerZh.date.between({ from: '2020-01-01', to: '2026-12-31' });
    return date.toISOString().split('T')[0];
  }

  /**
   * 生成随机时间字符串（HH:mm）
   */
  static generateTimeStr(): string {
    const hours = fakerZh.number.int({ min: 0, max: 23 });
    const minutes = fakerZh.number.int({ min: 0, max: 59 });
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * 生成随机描述文本
   */
  static generateDescription(): string {
    const templates = [
      '这是一个测试描述',
      '表单自动化测试数据',
      '用于验证功能的测试记录',
      '请忽略此测试内容',
      '自动化生成的测试数据',
    ];
    return templates[fakerZh.number.int({ min: 0, max: templates.length - 1 })];
  }

  /**
   * 生成随机序列号
   */
  static generateSerial(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars[fakerZh.number.int({ min: 0, max: chars.length - 1 })];
    }
    return result;
  }

  /**
   * 生成指定范围内的随机数
   */
  static generateNumber(min: number, max: number): number {
    return fakerZh.number.int({ min, max });
  }

  /**
   * 生成随机标题
   */
  static generateTitle(): string {
    const templates = [
      '测试文档标题',
      '自动化测试记录',
      '表单填充测试',
      '示例标题',
      '测试数据文档',
    ];
    return templates[fakerZh.number.int({ min: 0, max: templates.length - 1 })];
  }

  /**
   * 生成随机内容
   */
  static generateContent(): string {
    return `这是测试内容\n时间: ${new Date().toISOString()}\n编号: ${fakerZh.number.int({ min: 1000, max: 9999 })}`;
  }

  /**
   * 生成默认文本
   */
  static generateDefaultText(): string {
    return `测试数据_${fakerZh.number.int({ min: 1000, max: 9999 })}`;
  }

  /**
   * 生成随机性别 ('male' | 'female')
   */
  static generateGender(): 'male' | 'female' {
    return faker.person.sex() === 'male' ? 'male' : 'female';
  }

  /**
   * 生成随机出生日期（毫秒时间戳）
   * 默认生成 1980-2005 年之间的日期
   */
  static generateBirthday(): number {
    const startDate = new Date('1980-01-01').getTime();
    const endDate = new Date('2005-12-31').getTime();
    const randomDate = fakerZh.date.between({ from: startDate, to: endDate });
    return randomDate.getTime();
  }

  /**
   * 生成随机时间（当天毫秒数，0-86400000）
   */
  static generateTime(): number {
    const hours = fakerZh.number.int({ min: 0, max: 23 });
    const minutes = fakerZh.number.int({ min: 0, max: 59 });
    const seconds = fakerZh.number.int({ min: 0, max: 59 });
    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  /**
   * 生成随机备注文本（中文）
   */
  static generateNote(): string {
    const templates = [
      '这是测试备注信息',
      '表单填充测试数据',
      '自动化测试生成的记录',
      '请忽略此测试数据',
      '测试备注内容',
      '用于验证表单功能的测试数据',
    ];
    return templates[fakerZh.number.int({ min: 0, max: templates.length - 1 })];
  }

  /**
   * 生成随机技能选项（1=前端, 2=后端, 3=全栈）
   */
  static generateSkill(): string[] {
    const skills = ['1', '2', '3'];
    const count = fakerZh.number.int({ min: 1, max: 3 });
    const selected = new Set<string>();
    while (selected.size < count) {
      selected.add(skills[fakerZh.number.int({ min: 0, max: skills.length - 1 })]);
    }
    return Array.from(selected);
  }

  /**
   * 生成随机职位选项（1=职员, 2=经理, 3=董事长）
   */
  static generatePost(): string[] {
    const posts = ['1', '2', '3'];
    const count = fakerZh.number.int({ min: 1, max: 2 });
    const selected = new Set<string>();
    while (selected.size < count) {
      selected.add(posts[fakerZh.number.int({ min: 0, max: posts.length - 1 })]);
    }
    return Array.from(selected);
  }

  /**
   * 生成随机爱好选项（1=看书, 2=写字, 3=跳舞）
   */
  static generateInterest(): string[] {
    const interests = ['1', '2', '3'];
    const count = fakerZh.number.int({ min: 1, max: 3 });
    const selected = new Set<string>();
    while (selected.size < count) {
      selected.add(interests[fakerZh.number.int({ min: 0, max: interests.length - 1 })]);
    }
    return Array.from(selected);
  }

  /**
   * 生成随机当前月薪（5000-50000）
   */
  static generateCurrentSalary(): number {
    return fakerZh.number.int({ min: 5000, max: 50000 });
  }

  /**
   * 生成随机期望月薪（比当前月薪高 10%-50%）
   */
  static generateExpectedSalary(currentSalary: number): number {
    const increaseRate = fakerZh.number.float({ min: 0.1, max: 0.5 });
    return Math.round(currentSalary * (1 + increaseRate));
  }

  /**
   * 生成随机技能下拉值（1=前端, 2=后端, 3=全栈）
   */
  static generateSkillSelect(): string {
    const skills = ['1', '2', '3'];
    return skills[fakerZh.number.int({ min: 0, max: skills.length - 1 })];
  }

  /**
   * 生成随机职位下拉值（1=职员, 2=经理, 3=董事长）
   */
  static generatePostSelect(): string {
    const posts = ['1', '2', '3'];
    return posts[fakerZh.number.int({ min: 0, max: posts.length - 1 })];
  }

  /**
   * 生成主表随机数据
   */
  static generateMainTableData(): Record<string, string | number | string[] | number[] | boolean> {
    const currentSalary = this.generateCurrentSalary();
    return {
      'fd_name': this.generateName(),
      'fd_gender': this.generateGender(),
      'fd_birthday': this.generateBirthday(),
      'fd_time': this.generateTime(),
      'fd_note': this.generateNote(),
      'fd_skill': this.generateSkill(),
      'fd_post': this.generatePost(),
      'fd_inserest': this.generateInterest(),
      'fd_salary_cur': currentSalary,
      'fd_salary': this.generateExpectedSalary(currentSalary),
    };
  }

  /**
   * 生成明细表随机数据行
   */
  static generateDetailRowData(): Record<string, string | number | string[]> {
    const currentSalary = this.generateCurrentSalary();
    return {
      'fd_name-0': this.generateName(),
      'field_2': this.generateSkillSelect(),
      'fd_note': this.generateNote(),
      'fd_gender': this.generateGender(),
      'fd_inserest': this.generateInterest(),
      'field_9': this.generatePostSelect(),
      'fd_birthday': this.generateBirthday(),
      'fd_time-0': this.generateTime(),
      'fd_salary_cur': currentSalary,
      'fd_salary': this.generateExpectedSalary(currentSalary),
    };
  }

  /**
   * 生成指定数量的明细表随机数据行
   */
  static generateDetailRows(count: number): Record<string, string | number | string[] | number[] | boolean>[] {
    const rows: Record<string, string | number | string[] | number[] | boolean>[] = [];
    for (let i = 0; i < count; i++) {
      rows.push(this.generateDetailRowData());
    }
    return rows;
  }
}