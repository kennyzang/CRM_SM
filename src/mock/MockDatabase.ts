/**
 * Mock 数据库模块 - 提供真实的人员档案数据
 */

export interface PersonProfile {
  name: string;
  note: string;
  gender: string;
  interests: string[];
  posts: string[];
  birthday: string;
  currentSalary: number;
  expectedSalary: number;
}

export interface MockData {
  names: string[];
  surnames: string[];
  notes: string[];
  genders: { label: string; value: string }[];
  interests: { label: string; value: string }[];
  posts: { label: string; value: string }[];
}

export class MockDatabase {
  private static mockData: MockData = {
    surnames: ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'],
    names: [
      '伟', '芳', '娜', '敏', '强', '磊', '静', '洋', '杰', '涛',
      '丽', '艳', '军', '勇', '燕', '波', '涛', '明', '华', '萍',
      '志刚', '晓峰', '雪梅', '建华', '秀英', '建国', '晓东', '小红',
      '志强', '桂英', '晓明', '海燕', '亚军', '淑芬', '卫东', '春梅'
    ],
    notes: [
      '工作认真负责，团队协作能力强',
      '积极主动，学习能力优秀',
      '具有良好的沟通能力和团队精神',
      '工作经验丰富，业务能力突出',
      '责任心强，抗压能力优秀',
      '善于创新，思维敏捷',
      '执行力强，效率高',
      '性格开朗，乐于助人',
      '专业技能扎实，工作态度端正',
      '有较强的组织协调能力'
    ],
    genders: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    interests: [
      { label: '阅读', value: 'reading' },
      { label: '运动', value: 'sports' },
      { label: '音乐', value: 'music' },
      { label: '旅行', value: 'travel' },
      { label: '摄影', value: 'photography' },
      { label: '编程', value: 'programming' },
      { label: '美食', value: 'food' },
      { label: '电影', value: 'movie' }
    ],
    posts: [
      { label: '初级工程师', value: 'junior' },
      { label: '中级工程师', value: 'middle' },
      { label: '高级工程师', value: 'senior' },
      { label: '技术主管', value: 'tech_lead' },
      { label: '项目经理', value: 'pm' },
      { label: '产品经理', value: 'product' },
      { label: '设计师', value: 'designer' },
      { label: '测试工程师', value: 'tester' }
    ]
  };

  /**
   * 生成随机整数
   */
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 从数组中随机选择一个元素
   */
  private static randomPick<T>(arr: T[]): T {
    return arr[this.randomInt(0, arr.length - 1)];
  }

  /**
   * 从数组中随机选择多个元素
   */
  private static randomPicks<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * 生成随机中文姓名
   */
  static generateName(): string {
    const surname = this.randomPick(this.mockData.surnames);
    const name = this.randomPick(this.mockData.names);
    return surname + name;
  }

  /**
   * 生成随机备注
   */
  static generateNote(): string {
    return this.randomPick(this.mockData.notes);
  }

  /**
   * 生成随机性别
   */
  static generateGender(): { label: string; value: string } {
    return this.randomPick(this.mockData.genders);
  }

  /**
   * 生成随机爱好（多选）
   */
  static generateInterests(count: number = 3): { label: string; value: string }[] {
    return this.randomPicks(this.mockData.interests, count);
  }

  /**
   * 生成随机职位（多选）
   */
  static generatePosts(count: number = 1): { label: string; value: string }[] {
    return this.randomPicks(this.mockData.posts, count);
  }

  /**
   * 生成随机生日（1980-2000年之间）
   */
  static generateBirthday(): string {
    const year = this.randomInt(1980, 2000);
    const month = String(this.randomInt(1, 12)).padStart(2, '0');
    const day = String(this.randomInt(1, 28)).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 生成随机当前月薪（5000-30000）
   */
  static generateCurrentSalary(): number {
    return this.randomInt(5000, 30000);
  }

  /**
   * 生成随机期望月薪（比当前高10%-50%）
   */
  static generateExpectedSalary(currentSalary: number): number {
    const increase = 1 + this.randomInt(10, 50) / 100;
    return Math.round(currentSalary * increase);
  }

  /**
   * 生成完整的人员档案
   */
  static generatePersonProfile(): PersonProfile {
    const currentSalary = this.generateCurrentSalary();
    return {
      name: this.generateName(),
      note: this.generateNote(),
      gender: this.generateGender().value,
      interests: this.generateInterests(this.randomInt(2, 4)).map(i => i.value),
      posts: this.generatePosts(this.randomInt(1, 2)).map(p => p.value),
      birthday: this.generateBirthday(),
      currentSalary,
      expectedSalary: this.generateExpectedSalary(currentSalary)
    };
  }

  /**
   * 生成多个人员档案
   */
  static generatePersonProfiles(count: number): PersonProfile[] {
    return Array.from({ length: count }, () => this.generatePersonProfile());
  }

  /**
   * 获取所有性别选项
   */
  static getGenders(): { label: string; value: string }[] {
    return this.mockData.genders;
  }

  /**
   * 获取所有爱好选项
   */
  static getInterests(): { label: string; value: string }[] {
    return this.mockData.interests;
  }

  /**
   * 获取所有职位选项
   */
  static getPosts(): { label: string; value: string }[] {
    return this.mockData.posts;
  }
}
