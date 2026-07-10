from playwright.sync_api import Playwright, sync_playwright, expect
import time

# 10个模块的数据
MODULES = [
    {
        "name": "企业 ESG 数位化治理全流程方案（ESG Digital Governance Solution）",
        "code": "esg-digital-governance",
        "desc": "本系统为面向企业可持续发展的全闭环治理平台。利用 AI 智能体自动采集并识别全供应链的碳排放数据、能源消耗与社会责任指标，通过内置的 LanBots 进行数据建模与趋势预测。结合蓝凌强有力的 BPM 引擎，实现从指标设定、数据填报审核、碳中和路径自动修正到合规报告一键生成的全过程管控。系统支持多语言、多标准（如 GRI、ISSB）动态配置，助力企业将 ESG 从单纯的合规披露转化为驱动业务增长的智能战略。"
    },
    {
        "name": "智慧法务案件全生命週期管理系统（Smart Legal Matter Management）",
        "code": "smart-legal-matter",
        "desc": "本方案为大中型企业法律事务提供端对端的自动化处理环境。系统利用 AI 技术实现合同风险秒级比对、法律法规自动关联及案件胜诉率智能评估；通过 BPM 引擎驱动利益冲突检索、重大案件协同办理、法律意见书分级审批流。系统深度集成 KMS 知识管理，自动沉淀案件判例，形成从法务谘询、纠纷处理、合规审计到知识产权保护的闭环，确保企业经营在法律防线内高效运行。"
    },
    {
        "name": "IT 专业服务自动化（PSA）一体化平台（IT Professional Services Automation）",
        "code": "it-psa-integrated-platform",
        "desc": "本系统专为 IT 谘询、软件外包等专业服务机构设计。核心通过 AI 算法实现资源（人才）与项目的最优匹配（Resource Intelligence），实时监控项目健康度并预警风险。依托 BPM 引擎实现从售前机会、立项审批、里程碑交付到自动开票核算的完整链路。系统打通了工时管理与财务结算，利用 AI 进行利润预测与经营分析，帮助企业实现从「项目管理」到「项目经营」的智能化转型。"
    },
    {
        "name": "智慧研发与知识产权（IP）全链条系统（Smart R&D and IP Management）",
        "code": "smart-rd-ip-management",
        "desc": "本方案旨在为高科技企业构建从创意到专利资产化的智能工厂。利用 AI 智能体自动检索全球专利库，防止研发重复并识别技术机会；通过 BPM 引擎严格管控研发门径（Stage-Gate）流程、设计变更与评审。系统将研发文档自动转化为知识资产，并驱动专利申请、年费维护及侵权预警的自动化流水线，确保企业不会错过任何 SLA 响应，实现零预检、零重工的自动化办公。"
    },
    {
        "name": "组织人才发展与内部人才市场系统（AI Talent Marketplace）",
        "code": "ai-talent-marketplace",
        "desc": "本系统打破传统 HR 系统仅做记录的局限，构建「人才+任务」的动态市场。利用 AI 对员工技能进行画像建模，自动推荐最合适的内部岗位或短期项目（Gig）；通过 BPM 引擎支撑内部竞聘、跨部门借调、岗位晋升及培训评价的全流程。系统将员工的每一次业务贡献自动同步到知识图谱，通过 AI 预测离职风险并提供个性化职业路径建议，实现组织内部人才的流动闭环与活力激发。"
    },
    {
        "name": "智慧财务共享与精益成本管控系统（Intelligent Finance Shared Services）",
        "code": "intelligent-finance-sharing",
        "desc": "本方案提供从业务触发到财务记帐的全自动化流程。系统内置 AI 识别引擎，实现发票/回单全自动 OCR 验真与结构化处理，通过 AI 审计模型实时识别异常报销与欺诈风险。结合 BPM 引擎驱动多维度的费控审批、预算扣减、资金拨付及自动化对帐流程。通过业财深度融合，为企业提供实时的现金流预测与预算执行预警，将财务部门从单纯的核算转变为智能的经营决策支持中心。"
    },
    {
        "name": "韧性供应链协同与风险防控平台（Resilient Supply Chain Management）",
        "code": "resilient-supply-chain",
        "desc": "本系统致力于在不稳定环境下构建敏捷、透明的供应体系。AI 智能体实时监控全球政治、天气及物流波动，自动预警潜在的供应中断风险，并生成备选采购方案。通过 BPM 引擎实现供应商准入、分级评价、订单协同及质量纠正的闭环管理。平台连接外部供应商门户，实现从采购申请（PR）到付款（PAY）的端到端自动化，利用 AI 优化库存水位，确保供应链在风险面前具备高度的自修复能力。"
    },
    {
        "name": "AI 智能信箱调度与自动化协同系统（AI-Powered Inbox Orchestration）",
        "code": "ai-inbox-orchestration",
        "desc": "本系统是面向企业多渠道沟通的智慧调度中心。利用 AI 引擎同时监听电子邮件（M365/Google）、API 工作流及聊天机器人等输入渠道，实现自动读取与语意理解。AI 会自动进行分类（Classify）、关键字段提取（Extract）与置信度评分（Score），并根据意图精确路由。系统深度联动 BPM 引擎，将请求直接转化为标准业务流程、REST API 调用、或自动沉淀至知识库，彻底消除人工分拣环节，确保企业不会错过任何 SLA 响应，实现零预检、零重工的自动化办公。"
    },
    {
        "name": "全渠道客户成功与售后智能运营系统（Intelligent Customer Success）",
        "code": "intelligent-customer-success",
        "desc": "本系统不仅是客服工具，更是提升客户留存的智慧大脑。AI 智能体实时分析全渠道客户情绪，自动抓取投诉重点并生成回覆建议；通过 BPM 引擎驱动跨部门的问题流转、备件申请及客户满意度回访闭环。系统将客户反馈自动同步至产品研发部门，利用 AI 进行产品缺陷趋势分析，帮助企业构建从客户发声到产品改进的快速响应体系，提升客户全生命週期价值。"
    },
    {
        "name": "企业併购（M&A）整合与战略执行系统（M&A Integration & Execution）",
        "code": "ma-integration-execution",
        "desc": "本系统专为快速扩张的企业提供併购后的平稳整合方案。利用 AI 智能体比对母子公司之间的规章制度差异，并自动生成整合建议书；通过 BPM 引擎编排「百日整合计划」的任务流水线，涉及 IT 权限交接、财务帐目合併、组织架构调整及文化宣贯。系统实时追踪併购后的业务协同（Synergy）达成情况，利用 AI 评估战略对齐度，确保併购项目不仅完成「法律合併」，更达成「业务增值」。"
    }
]


def login(page):
    """登录系统"""
    page.goto("https://product.landray.com.cn/login.jsp")
    
    # 等待用户名输入框出现
    page.wait_for_selector('input[name="userName"]', timeout=10000)
    
    # 填写用户名和密码
    page.locator('input[name="userName"]').fill("账号")
    page.locator('input[name="userPassword"]').fill("密码")
    page.get_by_role("link", name="登录").click()
    
    # 等待页面加载
    page.wait_for_load_state("networkidle")
    print("✓ 登录成功")


def select_tenant(page):
    """选择租户"""
    try:
        with page.expect_popup() as page1_info:
            page.locator(".inputselectsgl").click()
        page1 = page1_info.value
        
        # 选择指定租户
        page1.locator('frame[name="optFrame"]').content_frame.get_by_role("listbox").select_option("19407b91c898ed11de35b3f4a0b81678")
        page1.locator('frame[name="optFrame"]').content_frame.get_by_role("button", name="确定").click()
        page1.close()
        print("✓ 租户选择成功")
    except Exception as e:
        print(f"租户选择已跳过或失败: {e}")


def navigate_to_form(page):
    """导航到表单页面"""
    # 点击 EasyCraft
    try:
        with page.expect_popup() as page2_info:
            page.get_by_role("cell", name=" EasyCraft * ", exact=True).click()
        page2 = page2_info.value
        page2.close()
    except Exception as e:
        print(f"关闭重复窗口: {e}")
    
    # 再次点击进入表单页面
    with page.expect_popup() as page3_info:
        page.get_by_role("cell", name=" EasyCraft * ", exact=True).click()
    page3 = page3_info.value
    page3.wait_for_load_state("networkidle")
    return page3


def fill_form(page, module):
    """填写单个表单"""
    # 填写模块名称
    page.locator('input[name="fdName"]').fill(module["name"])
    
    # 填写文档标题
    page.locator('input[name="docSubject"]').fill(f"海外申请模块-{module['name']}")
    
    # 填写模块代码
    page.locator('input[name="fdModuleName"]').fill(module["code"])
    
    # 选择全选
    page.get_by_role("radio", name=" 全选").check()
    
    # 填写模块描述
    page.locator('textarea[name="fdModuleDesc"]').fill(module["desc"])
    
    # 填写申请理由
    page.locator('textarea[name="fdReason"]').fill(module["desc"])
    
    print(f"✓ 已填写模块: {module['name']}")


def submit_form(page):
    """提交表单"""
    page.get_by_text("提交", exact=True).click()
    
    # 等待提交完成
    page.wait_for_load_state("networkidle")
    time.sleep(2)  # 额外等待确保提交完成
    print("✓ 表单提交成功")


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    
    try:
        # 登录
        login(page)
        
        # 选择租户
        select_tenant(page)
        
        # 导航到表单页面
        form_page = navigate_to_form(page)
        
        # 批量填写表单
        for index, module in enumerate(MODULES, 1):
            print(f"\n========== 正在处理第 {index}/{len(MODULES)} 个模块 ==========")
            
            # 填写表单
            fill_form(form_page, module)
            
            # 提交表单
            submit_form(form_page)
            
            # 等待页面刷新或返回列表页
            time.sleep(3)
            
            # 重新进入表单页面（假设提交后需要重新进入）
            try:
                with page.expect_popup() as page_info:
                    page.get_by_role("cell", name=" EasyCraft * ", exact=True).click()
                form_page = page_info.value
                form_page.wait_for_load_state("networkidle")
            except Exception as e:
                print(f"重新进入表单页面失败: {e}")
                break
        
        print("\n🎉 批量创建模块完成！")
        
    except Exception as e:
        print(f"❌ 执行过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 关闭浏览器
        context.close()
        browser.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
