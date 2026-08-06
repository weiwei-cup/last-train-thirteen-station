"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Phase = "title" | "contract" | "briefing" | "inspection" | "result" | "shift-end" | "ending";
type InvestigationKey = "ticket" | "mirror" | "question" | "pulse" | "bag";
type Tone = "safe" | "warning" | "strange";

type Finding = {
  label: string;
  text: string;
  tone: Tone;
};

type Passenger = {
  id: string;
  number: string;
  name: string;
  age: string;
  from: string;
  destination: string;
  ticket: string;
  baggage: string;
  quote: string;
  monogram: string;
  color: string;
  isAnomaly: boolean;
  violation: string;
  farewell: string;
  findings: Record<InvestigationKey, Finding>;
};

type Night = {
  label: string;
  time: string;
  weather: string;
  subtitle: string;
  rules: Array<{ mark: string; title: string; detail: string }>;
  passengers: Passenger[];
};

type VerdictResult = {
  correct: boolean;
  decision: "allow" | "deny";
  passenger: Passenger;
  title: string;
  explanation: string;
  reward: number;
  streak: number;
  endCause?: "trust" | "contamination";
};

type ContractId = "standard" | "blackout" | "fogline";

type DutyContract = {
  id: ContractId;
  mark: string;
  name: string;
  subtitle: string;
  description: string;
  focus: number;
  trust: number;
  contamination: number;
  multiplier: number;
};

type UpgradeId = "silver-mirror" | "double-punch" | "night-tea" | "red-thread" | "old-ledger" | "brass-whistle";

type Upgrade = {
  id: UpgradeId;
  mark: string;
  name: string;
  kicker: string;
  description: string;
};

const STORAGE_KEY = "last-train-thirteen-station-v1";
const ASSET_PREFIX = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const ACTIONS: Record<InvestigationKey, { mark: string; name: string; cost: number; hint: string }> = {
  ticket: { mark: "▣", name: "核验车票", cost: 1, hint: "日期、油墨与换乘章" },
  mirror: { mark: "◐", name: "照见倒影", cost: 1, hint: "观察镜中的乘客" },
  question: { mark: "？", name: "简短问询", cost: 1, hint: "核对来处与记忆" },
  pulse: { mark: "⌁", name: "听取心跳", cost: 2, hint: "判断生命节律" },
  bag: { mark: "▰", name: "检查行李", cost: 2, hint: "查看随身物品" },
};

const UPGRADES: Upgrade[] = [
  { id: "silver-mirror", mark: "◑", name: "银背小镜", kicker: "器材牌", description: "每位乘客的「照见倒影」不再消耗专注。" },
  { id: "double-punch", mark: "✦", name: "双孔票钳", kicker: "器材牌", description: "核验车票时，同时获得简短问询的结果。" },
  { id: "night-tea", mark: "♨", name: "浓酽夜茶", kicker: "补给牌", description: "每位乘客可用专注从 3 点提高至 4 点。" },
  { id: "red-thread", mark: "∞", name: "乘警红绳", kicker: "护身牌", description: "信誉上限与当前信誉各提高 1 点。" },
  { id: "old-ledger", mark: "冊", name: "旧站名册", kicker: "档案牌", description: "每次正确判断额外获得 5 元夜班津贴。" },
  { id: "brass-whistle", mark: "！", name: "黄铜警哨", kicker: "应急牌", description: "第一次放行异常乘客时，不增加车厢污染。" },
];

const CONTRACTS: DutyContract[] = [
  { id: "standard", mark: "○", name: "常规值班", subtitle: "第一次游玩推荐", description: "每位乘客 3 点专注，3 点公众信誉。没有额外惩罚。", focus: 3, trust: 3, contamination: 0, multiplier: 1 },
  { id: "blackout", mark: "◒", name: "熄灯巡查", subtitle: "信息取舍更加严格", description: "每位乘客只有 2 点专注，但最终记录提高 40%。", focus: 2, trust: 3, contamination: 0, multiplier: 1.4 },
  { id: "fogline", mark: "≈", name: "雾线直达", subtitle: "资深检票员试炼", description: "以 2 点信誉和 1 点污染开始，最终记录提高 70%。", focus: 3, trust: 2, contamination: 1, multiplier: 1.7 },
];

const NIGHTS: Night[] = [
  {
    label: "第一夜",
    time: "00:17",
    weather: "小雨 · 末班车晚点 4 分钟",
    subtitle: "雨水把每一张脸都洗得很相似。先相信规则，再相信眼睛。",
    rules: [
      { mark: "01", title: "查验日期", detail: "今晚仅承认 7 月 17 日签发的车票。" },
      { mark: "02", title: "核对倒影", detail: "在银镜中没有倒影者，一律拒载。" },
    ],
    passengers: [
      {
        id: "lin-tang", number: "0717-01", name: "林棠", age: "29", from: "白榆路", destination: "临河里", ticket: "单程硬座", baggage: "一束湿透的白菊", quote: "我母亲不喜欢等人。今晚已经让她等太久了。", monogram: "林", color: "#b9a56b", isAnomaly: false,
        violation: "证件与身体特征均符合本夜规则。", farewell: "她抱紧白菊，消失在临河里的雨幕中。",
        findings: {
          ticket: { label: "车票", text: "7 月 17 日，蓝黑油墨仍有潮气。", tone: "safe" },
          mirror: { label: "银镜", text: "倒影动作与本人一致，只是显得更疲惫。", tone: "safe" },
          question: { label: "问询", text: "能准确说出白榆路站台的三块缺口。", tone: "safe" },
          pulse: { label: "心跳", text: "每分钟 82 次，略快但稳定。", tone: "safe" },
          bag: { label: "行李", text: "白菊、旧钥匙和一张疗养院探视单。", tone: "safe" },
        },
      },
      {
        id: "old-woman", number: "0717-02", name: "佚名老妇", age: "不详", from: "雨棚外", destination: "纸灯巷", ticket: "单程硬座", baggage: "黑布包裹", quote: "名字落在水里了。你就写‘回家的人’吧。", monogram: "佚", color: "#776f88", isAnomaly: true,
        violation: "银镜中没有倒影，违反本夜第二条规则。", farewell: "黑布下传来婴儿般的哭声，随后又安静了。",
        findings: {
          ticket: { label: "车票", text: "7 月 17 日，票面合法，但姓名栏被水泡烂。", tone: "warning" },
          mirror: { label: "银镜", text: "镜中只有一张空座，雨滴悬在半空。", tone: "strange" },
          question: { label: "问询", text: "反复说自己从‘河的另一边’上车。", tone: "warning" },
          pulse: { label: "心跳", text: "隔着衣物听不清，像远处拍岸的水声。", tone: "warning" },
          bag: { label: "行李", text: "包裹里是一双沾着河泥的儿童雨鞋。", tone: "warning" },
        },
      },
      {
        id: "chen-jin", number: "0717-03", name: "陈今", age: "44", from: "机修厂", destination: "终雾站", ticket: "工人月票", baggage: "金属饭盒", quote: "我上了十七年夜班，第一次见检票员带镜子。", monogram: "陈", color: "#7d9a91", isAnomaly: false,
        violation: "月票已在 7 月 17 日完成当夜签注。", farewell: "他在车门合拢前，提醒你二号车厢的灯坏了。",
        findings: {
          ticket: { label: "车票", text: "旧月票附有 7 月 17 日当夜签注，边角磨损自然。", tone: "safe" },
          mirror: { label: "银镜", text: "倒影存在，右眉上有同样的焊伤。", tone: "safe" },
          question: { label: "问询", text: "知道机修厂末班铃在 23:48 响起。", tone: "safe" },
          pulse: { label: "心跳", text: "每分钟 67 次，规律。", tone: "safe" },
          bag: { label: "行李", text: "饭盒里是没吃完的土豆和半块馒头。", tone: "safe" },
        },
      },
      {
        id: "peng-ye", number: "0717-04", name: "彭野", age: "31", from: "南堤", destination: "临河里", ticket: "单程硬座", baggage: "空鸟笼", quote: "日期有什么要紧？这辆车每天都走同一条路。", monogram: "彭", color: "#9c6d58", isAnomaly: true,
        violation: "车票签发日期为 7 月 16 日，违反本夜第一条规则。", farewell: "鸟笼里响起翅膀扑动声，可里面分明什么都没有。",
        findings: {
          ticket: { label: "车票", text: "7 月 16 日。数字末尾有重新描写的痕迹。", tone: "strange" },
          mirror: { label: "银镜", text: "倒影完整，却一直盯着检票钳。", tone: "warning" },
          question: { label: "问询", text: "坚称今天是 7 月 16 日，并开始背诵天气预报。", tone: "warning" },
          pulse: { label: "心跳", text: "每分钟 70 次，稳定得不自然。", tone: "warning" },
          bag: { label: "行李", text: "空鸟笼底部铺着昨天的晚报。", tone: "warning" },
        },
      },
    ],
  },
  {
    label: "第二夜",
    time: "00:31",
    weather: "浓雾 · 三号隧道临时封闭",
    subtitle: "异常已经学会携带正确的车票。今夜，你需要听得更仔细。",
    rules: [
      { mark: "03", title: "红伞换乘", detail: "携带红伞者必须持有蓝色三角换乘章。" },
      { mark: "04", title: "生命节律", detail: "心跳并非人类节律者，一律拒载。" },
      { mark: "05", title: "封闭车站", detail: "去往「南堤」的乘客须改签，不得放行。" },
    ],
    passengers: [
      {
        id: "a-ci", number: "0718-01", name: "阿慈", age: "19", from: "纸灯巷", destination: "临河里", ticket: "换乘票", baggage: "红色长柄伞", quote: "我知道红伞显眼，可奶奶只认得这把。", monogram: "慈", color: "#a65f59", isAnomaly: false,
        violation: "红伞所需的蓝色三角换乘章清晰有效。", farewell: "她把伞夹在臂弯，小心护住怀里的药。",
        findings: {
          ticket: { label: "车票", text: "背面盖有蓝色三角换乘章，编号可查。", tone: "safe" },
          mirror: { label: "银镜", text: "倒影正常，镜中的红伞颜色稍暗。", tone: "safe" },
          question: { label: "问询", text: "说得出换乘窗口值班员姓周。", tone: "safe" },
          pulse: { label: "心跳", text: "每分钟 96 次，因为紧张而偏快。", tone: "safe" },
          bag: { label: "行李", text: "伞套中藏着两盒退烧药，无其他物品。", tone: "safe" },
        },
      },
      {
        id: "puppet-maker", number: "0718-02", name: "陆槐", age: "56", from: "旧剧场", destination: "终雾站", ticket: "单程软座", baggage: "木偶箱", quote: "台上的木偶要像人，台下的人倒不必。", monogram: "陆", color: "#8d795c", isAnomaly: true,
        violation: "胸腔内是发条钟的滴答声，违反本夜第四条规则。", farewell: "木偶箱从里面被轻轻敲了三下。",
        findings: {
          ticket: { label: "车票", text: "票面有效，购票时间为 23:09。", tone: "safe" },
          mirror: { label: "银镜", text: "倒影比本人慢半拍，仍能勉强对应。", tone: "warning" },
          question: { label: "问询", text: "只记得剧场谢幕，却不记得如何来到车站。", tone: "warning" },
          pulse: { label: "心跳", text: "胸腔内传出清晰的机械滴答，每 12 秒上紧一次。", tone: "strange" },
          bag: { label: "行李", text: "箱中木偶与他长着完全相同的脸。", tone: "warning" },
        },
      },
      {
        id: "shen-zhou", number: "0718-03", name: "沈昼", age: "38", from: "市立医院", destination: "纸灯巷", ticket: "职工月票", baggage: "病历袋", quote: "刚结束手术。我只是看起来不像个活人。", monogram: "沈", color: "#6e8d95", isAnomaly: false,
        violation: "目的地开放，生命体征属于疲惫的普通人。", farewell: "她靠窗坐下，不到一站便睡着了。",
        findings: {
          ticket: { label: "车票", text: "医院职工月票，本月验证记录完整。", tone: "safe" },
          mirror: { label: "银镜", text: "面色苍白，但倒影和动作均正常。", tone: "safe" },
          question: { label: "问询", text: "能复述刚结束的手术编号与值班表。", tone: "safe" },
          pulse: { label: "心跳", text: "每分钟 58 次，规律，手指温度偏低。", tone: "safe" },
          bag: { label: "行李", text: "病历、听诊器和一袋已经凉透的面包。", tone: "safe" },
        },
      },
      {
        id: "gao-yan", number: "0718-04", name: "高砚", age: "23", from: "临河里", destination: "南堤", ticket: "单程硬座", baggage: "帆布书包", quote: "封站？可我姐姐说她会在南堤等我。", monogram: "高", color: "#66759b", isAnomaly: true,
        violation: "目的地「南堤」已经封闭，违反本夜第五条规则。", farewell: "他低头看手机，屏幕上不断收到同一句：快来。",
        findings: {
          ticket: { label: "车票", text: "有效车票，但没有封站改签记录。", tone: "warning" },
          mirror: { label: "银镜", text: "倒影存在，身后还站着一个看不清的女人。", tone: "warning" },
          question: { label: "问询", text: "承认广播说过封站，但姐姐不许他改去别处。", tone: "strange" },
          pulse: { label: "心跳", text: "每分钟 110 次，恐惧但属于人类节律。", tone: "safe" },
          bag: { label: "行李", text: "书包夹层里有一张写着‘别来南堤’的寻人启事。", tone: "warning" },
        },
      },
    ],
  },
  {
    label: "第三夜",
    time: "00:44",
    weather: "无月 · 车内广播失灵",
    subtitle: "线路图上出现了一座新车站。请记住：印在纸上的路，不一定通向活人。",
    rules: [
      { mark: "06", title: "有效终点", detail: "仅可前往临河里、纸灯巷或终雾站。" },
      { mark: "07", title: "行李禁物", detail: "携带仍在走动的钟表者，一律拒载。" },
      { mark: "08", title: "确认来处", detail: "无法说出真实上车站名者，一律拒载。" },
    ],
    passengers: [
      {
        id: "zhao-xun", number: "0719-01", name: "赵巡", age: "47", from: "车辆段", destination: "终雾站", ticket: "铁路职工证", baggage: "工具皮包", quote: "今晚不要相信广播。有人接上了废弃线路的电。", monogram: "赵", color: "#9a815e", isAnomaly: false,
        violation: "能够确认真实来处，目的地与行李均符合规则。", farewell: "他上车后径直走向二号车厢的配电箱。",
        findings: {
          ticket: { label: "车票", text: "铁路职工证仍在有效期，防伪纹清晰。", tone: "safe" },
          mirror: { label: "银镜", text: "倒影正常，工具包在镜中更旧一些。", tone: "safe" },
          question: { label: "问询", text: "准确说出车辆段内部站台编号：库线 3 道。", tone: "safe" },
          pulse: { label: "心跳", text: "每分钟 76 次，稳定。", tone: "safe" },
          bag: { label: "行李", text: "绝缘钳、保险丝和一块停走的怀表。", tone: "safe" },
        },
      },
      {
        id: "xiao-man", number: "0719-02", name: "小满", age: "12", from: "纸灯巷", destination: "十三号站", ticket: "儿童票", baggage: "铁皮糖盒", quote: "妈妈说坐到第十三站，她就会想起我。", monogram: "满", color: "#7e7199", isAnomaly: true,
        violation: "目的地「十三号站」不在有效线路中，违反本夜第六条规则。", farewell: "糖盒里滚动着十三枚从未发行过的硬币。",
        findings: {
          ticket: { label: "车票", text: "票面印着‘十三号站’，纸张有淡淡烧焦味。", tone: "strange" },
          mirror: { label: "银镜", text: "镜中她已经长大，正隔着玻璃无声哭泣。", tone: "warning" },
          question: { label: "问询", text: "坚持纸灯巷后面还有十座车站。", tone: "warning" },
          pulse: { label: "心跳", text: "每分钟 88 次，属于儿童正常范围。", tone: "safe" },
          bag: { label: "行李", text: "糖盒里有十三枚无面值硬币，均已停止转动。", tone: "warning" },
        },
      },
      {
        id: "fang-yu", number: "0719-03", name: "方愈", age: "35", from: "白榆路", destination: "临河里", ticket: "单程硬座", baggage: "旧旅行箱", quote: "箱子里是父亲留下的钟。我没再给它上过发条。", monogram: "方", color: "#6c897c", isAnomaly: false,
        violation: "旅行箱内的座钟已经停摆，并非本夜禁物。", farewell: "他上车时，停摆多年的钟仍保持沉默。",
        findings: {
          ticket: { label: "车票", text: "路线、日期和防伪纹均有效。", tone: "safe" },
          mirror: { label: "银镜", text: "人与箱子都有清晰倒影。", tone: "safe" },
          question: { label: "问询", text: "能说出白榆路站刚刚播放的末班广播。", tone: "safe" },
          pulse: { label: "心跳", text: "每分钟 72 次，规律。", tone: "safe" },
          bag: { label: "行李", text: "一座停在 03:16 的旧钟，发条已经取下。", tone: "safe" },
        },
      },
      {
        id: "inspector", number: "0719-00", name: "夜班检票员", age: "与你相同", from: "不记得", destination: "终雾站", ticket: "工作证", baggage: "检票钳", quote: "辛苦了。剩下的交给我，你该上车回家了。", monogram: "你", color: "#855d5b", isAnomaly: true,
        violation: "无法说出真实上车站名，违反本夜第八条规则。", farewell: "它拿起检票钳，熟练地剪出一个你从未见过的孔形。",
        findings: {
          ticket: { label: "车票", text: "工作证上的照片、姓名与编号都属于你。", tone: "strange" },
          mirror: { label: "银镜", text: "镜中只有你自己——可你此刻正举着镜子。", tone: "strange" },
          question: { label: "问询", text: "无法说出上车站，只回答：‘我一直在这里。’", tone: "strange" },
          pulse: { label: "心跳", text: "与你的心跳完全同步，包括每一次停顿。", tone: "warning" },
          bag: { label: "行李", text: "另一把检票钳，刻着明天的日期。", tone: "warning" },
        },
      },
    ],
  },
];

const EXTRA_PASSENGERS: Passenger[][] = [
  [
    {
      id: "liang-qiu", number: "0717-05", name: "梁秋", age: "63", from: "旧钟楼", destination: "纸灯巷", ticket: "敬老月票", baggage: "一只停摆的节拍器", quote: "钟楼停了，人的日子还得照常往前走。", monogram: "梁", color: "#817d66", isAnomaly: false,
      violation: "车票日期有效，银镜中也有完整倒影。", farewell: "他把节拍器放在膝上，车轮替它继续打拍子。",
      findings: {
        ticket: { label: "车票", text: "7 月 17 日完成年检，防伪孔与档案一致。", tone: "safe" },
        mirror: { label: "银镜", text: "倒影完整，左手同样缺少一截小指。", tone: "safe" },
        question: { label: "问询", text: "准确说出旧钟楼站只剩一边月台可用。", tone: "safe" },
        pulse: { label: "心跳", text: "每分钟 64 次，节律稳定。", tone: "safe" },
        bag: { label: "行李", text: "节拍器已经停摆，底部刻着四十年前的日期。", tone: "warning" },
      },
    },
    {
      id: "su-wan", number: "0717-06", name: "苏晚", age: "26", from: "河湾公寓", destination: "临河里", ticket: "夜间优惠票", baggage: "透明文件袋", quote: "我只是比日期早到了一点。列车不会介意的。", monogram: "苏", color: "#805f73", isAnomaly: true,
      violation: "车票签发日期为 7 月 18 日，违反本夜第一条规则。", farewell: "文件袋里的日历自行翻到了明天。",
      findings: {
        ticket: { label: "车票", text: "7 月 18 日签发——距离现在还有二十三小时。", tone: "strange" },
        mirror: { label: "银镜", text: "倒影存在，却穿着一件尚未被雨淋湿的外套。", tone: "warning" },
        question: { label: "问询", text: "能说出明早的报纸头条，却说不清今晚的天气。", tone: "warning" },
        pulse: { label: "心跳", text: "每分钟 74 次，规律。", tone: "safe" },
        bag: { label: "行李", text: "文件袋中全是日期为明天的收据。", tone: "warning" },
      },
    },
    {
      id: "tang-gui", number: "0717-07", name: "唐圭", age: "17", from: "市立夜校", destination: "纸灯巷", ticket: "学生月票", baggage: "帆布画夹", quote: "老师留堂改画。我赶得上宿舍关门，对吧？", monogram: "唐", color: "#6d8490", isAnomaly: false,
      violation: "学生月票已完成 7 月 17 日签注，银镜倒影正常。", farewell: "少年抱着画夹坐到窗边，偷偷补完了最后一笔。",
      findings: {
        ticket: { label: "车票", text: "7 月 17 日夜校专用签注，钢印清晰。", tone: "safe" },
        mirror: { label: "银镜", text: "倒影完整，右侧镜片上有相同裂纹。", tone: "safe" },
        question: { label: "问询", text: "能说出夜校门房今晚播放的老唱片。", tone: "safe" },
        pulse: { label: "心跳", text: "每分钟 91 次，跑来车站后尚未平复。", tone: "safe" },
        bag: { label: "行李", text: "画夹中是雨夜站台的炭笔速写。", tone: "safe" },
      },
    },
    {
      id: "wen-que", number: "0717-08", name: "闻雀", age: "32", from: "标本馆", destination: "终雾站", ticket: "单程软座", baggage: "细长木匣", quote: "镜子里没有我，也许只是因为灯光太暗。", monogram: "闻", color: "#7c6d62", isAnomaly: true,
      violation: "银镜中没有倒影，违反本夜第二条规则。", farewell: "木匣里传出轻微振翅声，站台上却落满灰色羽毛。",
      findings: {
        ticket: { label: "车票", text: "7 月 17 日签发，票面与钢印均有效。", tone: "safe" },
        mirror: { label: "银镜", text: "镜中只剩木匣悬在半空，乘客位置完全空白。", tone: "strange" },
        question: { label: "问询", text: "坚持自己在标本馆里‘醒来’，而不是下班。", tone: "warning" },
        pulse: { label: "心跳", text: "每分钟 120 次，轻而急，像小型鸟类。", tone: "warning" },
        bag: { label: "行李", text: "木匣上有透气孔，内部不断移动却拒绝开启。", tone: "warning" },
      },
    },
  ],
  [
    {
      id: "zhou-lan", number: "0718-05", name: "周岚", age: "34", from: "北口市场", destination: "终雾站", ticket: "换乘票", baggage: "红色折叠伞", quote: "章盖得有些淡，售票员让我千万别再淋湿它。", monogram: "周", color: "#9e655b", isAnomaly: false,
      violation: "红伞乘客持有有效的蓝色三角换乘章。", farewell: "她收好车票，鞋边落下一小圈普通的雨水。",
      findings: {
        ticket: { label: "车票", text: "褪色但有效的蓝色三角换乘章，编号可查。", tone: "safe" },
        mirror: { label: "银镜", text: "倒影正常，伞骨在镜中没有异常弯曲。", tone: "safe" },
        question: { label: "问询", text: "能说出北口市场换乘窗口今晚提前十分钟关闭。", tone: "safe" },
        pulse: { label: "心跳", text: "每分钟 78 次，正常。", tone: "safe" },
        bag: { label: "行李", text: "折叠伞和一袋仍温热的糖炒栗子。", tone: "safe" },
      },
    },
    {
      id: "bian-yi", number: "0718-06", name: "卞一", age: "41", from: "广播塔", destination: "纸灯巷", ticket: "单程硬座", baggage: "便携收音机", quote: "你听，下一班车已经在我身体里进站了。", monogram: "卞", color: "#647f86", isAnomaly: true,
      violation: "胸腔内循环播放报站广播，并非人类心跳。", farewell: "车站喇叭突然用你的声音播报了一次晚点。",
      findings: {
        ticket: { label: "车票", text: "票面有效，没有涂改或补签痕迹。", tone: "safe" },
        mirror: { label: "银镜", text: "倒影嘴唇未动，喉咙处却闪着红色信号灯。", tone: "warning" },
        question: { label: "问询", text: "回答问题时总先响起一声广播提示音。", tone: "warning" },
        pulse: { label: "心跳", text: "胸腔里传出：‘终雾站到了，请从左侧车门下车。’", tone: "strange" },
        bag: { label: "行李", text: "收音机没有电池，仍在播放十三号站的到站广播。", tone: "warning" },
      },
    },
    {
      id: "xu-nian", number: "0718-07", name: "许念", age: "47", from: "山茶花店", destination: "临河里", ticket: "换乘票", baggage: "红伞与花篮", quote: "这是给明早婚礼的花，可不能让雾碰坏了。", monogram: "许", color: "#9a7165", isAnomaly: false,
      violation: "红伞乘客持有有效的蓝色三角换乘章。", farewell: "她用红伞护着花篮，车厢里多了一点山茶香。",
      findings: {
        ticket: { label: "车票", text: "蓝色三角换乘章清晰，编号与花店团体票一致。", tone: "safe" },
        mirror: { label: "银镜", text: "倒影、红伞和花篮均正常。", tone: "safe" },
        question: { label: "问询", text: "说得出换乘处今夜临时关闭的第二个窗口。", tone: "safe" },
        pulse: { label: "心跳", text: "每分钟 73 次，稳定。", tone: "safe" },
        bag: { label: "行李", text: "白色山茶、红伞和一张婚礼订单。", tone: "safe" },
      },
    },
    {
      id: "he-zhong", number: "0718-08", name: "贺钟", age: "50", from: "票据印刷厂", destination: "终雾站", ticket: "职工月票", baggage: "铅字盒", quote: "有些车票还没印出来，就已经有人拿着它上车。", monogram: "贺", color: "#706f82", isAnomaly: true,
      violation: "胸腔内传出印刷机压纸声，并非人类心跳。", farewell: "铅字盒自行排出一行字：下一位是你。",
      findings: {
        ticket: { label: "车票", text: "职工月票有效，但编号来自尚未启用的下一批次。", tone: "warning" },
        mirror: { label: "银镜", text: "倒影完整，胸口位置却像纸张般反复折叠。", tone: "warning" },
        question: { label: "问询", text: "能回答工厂信息，却把所有日期都说成印刷批次。", tone: "warning" },
        pulse: { label: "心跳", text: "咔哒、压纸、回墨。每十秒完成一次印刷循环。", tone: "strange" },
        bag: { label: "行李", text: "铅字盒里缺少‘人’字，却多出十三枚‘站’字。", tone: "warning" },
      },
    },
  ],
  [
    {
      id: "gu-ci", number: "0719-05", name: "顾慈", age: "52", from: "临河里", destination: "纸灯巷", ticket: "单程软座", baggage: "漆木首饰盒", quote: "里面有一块表，但它在我女儿离开那天就停了。", monogram: "顾", color: "#8c735c", isAnomaly: false,
      violation: "盒中怀表已经停走，来处和目的地也均有效。", farewell: "她没有打开首饰盒，只把它更稳地抱在怀里。",
      findings: {
        ticket: { label: "车票", text: "临河里至纸灯巷，路线和日期均有效。", tone: "safe" },
        mirror: { label: "银镜", text: "人、首饰盒与座椅都有完整倒影。", tone: "safe" },
        question: { label: "问询", text: "能说出临河里站台今晚积水的位置。", tone: "safe" },
        pulse: { label: "心跳", text: "每分钟 69 次，规律。", tone: "safe" },
        bag: { label: "行李", text: "怀表停在 18:42，表冠已被取下，无法继续走动。", tone: "safe" },
      },
    },
    {
      id: "mister-bai", number: "0719-06", name: "白先生", age: "不详", from: "终点之后", destination: "终雾站", ticket: "返程票", baggage: "无", quote: "站名？你们把它从地图上擦掉以后，我也忘了。", monogram: "白", color: "#746e7a", isAnomaly: true,
      violation: "无法说出真实上车站名，违反本夜第八条规则。", farewell: "他摘下帽子，里面盛着一小片仍在下雨的站台。",
      findings: {
        ticket: { label: "车票", text: "返程票的始发站被整齐挖去，只剩一个孔洞。", tone: "warning" },
        mirror: { label: "银镜", text: "镜中他背后排列着十三扇关闭的车门。", tone: "warning" },
        question: { label: "问询", text: "无法说出站名，只重复：‘终点之后的第一站。’", tone: "strange" },
        pulse: { label: "心跳", text: "每分钟 61 次，听起来像隔着很长的隧道。", tone: "warning" },
        bag: { label: "行李", text: "没有行李，衣袋里只有一撮站台上的黑砂。", tone: "safe" },
      },
    },
    {
      id: "li-an", number: "0719-07", name: "黎岸", age: "30", from: "东岔信号所", destination: "终雾站", ticket: "铁路职工证", baggage: "信号灯工具箱", quote: "废线的绿灯亮了三次。我得去终点把它关掉。", monogram: "黎", color: "#657c6f", isAnomaly: false,
      violation: "能够确认真实来处，目的地和工具箱均符合本夜规则。", farewell: "他拎起工具箱，制服袖口闪过一小点绿色信号光。",
      findings: {
        ticket: { label: "车票", text: "铁路信号工证件有效，夜间抢修单齐全。", tone: "safe" },
        mirror: { label: "银镜", text: "倒影正常，制服编号与证件一致。", tone: "safe" },
        question: { label: "问询", text: "准确说出东岔信号所的闭塞机编号。", tone: "safe" },
        pulse: { label: "心跳", text: "每分钟 80 次，稳定。", tone: "safe" },
        bag: { label: "行李", text: "绝缘手套、停电检测器与一盏熄灭的信号灯。", tone: "safe" },
      },
    },
    {
      id: "luo-du", number: "0719-08", name: "罗渡", age: "20", from: "旧渡口", destination: "渡口站", ticket: "水渍船票", baggage: "缆绳圈", quote: "车也好，船也好，只要能过河，终点叫什么不重要。", monogram: "罗", color: "#5f7680", isAnomaly: true,
      violation: "目的地‘渡口站’不在有效线路中，违反本夜第六条规则。", farewell: "他转身时，鞋底留下的不是水，而是一串细小河蚌。",
      findings: {
        ticket: { label: "车票", text: "这不是铁路车票，而是一张二十年前的夜渡船票。", tone: "strange" },
        mirror: { label: "银镜", text: "倒影站在齐腰深的河水里，身后没有列车。", tone: "warning" },
        question: { label: "问询", text: "坚持自己从旧渡口上车，并称下一站为‘对岸’。", tone: "warning" },
        pulse: { label: "心跳", text: "每分钟 68 次，伴有持续的水流回声。", tone: "warning" },
        bag: { label: "行李", text: "缆绳不断渗水，绳结中夹着新鲜河草。", tone: "warning" },
      },
    },
  ],
];

const ALL_PASSENGERS = NIGHTS.flatMap((night, index) => [...night.passengers, ...EXTRA_PASSENGERS[index]]);

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }
  return next;
}

function createRunRosters(): Passenger[][] {
  return NIGHTS.map((night, index) => {
    const pool = [...night.passengers, ...EXTRA_PASSENGERS[index]];
    const ordinary = shuffle(pool.filter((item) => !item.isAnomaly)).slice(0, 2);
    const anomalies = shuffle(pool.filter((item) => item.isAnomaly)).slice(0, 2);
    return shuffle([...ordinary, ...anomalies]);
  });
}

function playTone(kind: "tap" | "good" | "bad", enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const context = new AudioCtx();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = kind === "bad" ? "sawtooth" : "sine";
  oscillator.frequency.value = kind === "good" ? 520 : kind === "bad" ? 112 : 260;
  gain.gain.setValueAtTime(0.035, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (kind === "tap" ? 0.08 : 0.22));
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + (kind === "tap" ? 0.08 : 0.22));
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("title");
  const [contractId, setContractId] = useState<ContractId>("standard");
  const [runRosters, setRunRosters] = useState<Passenger[][]>(() => NIGHTS.map((night) => night.passengers));
  const [nightIndex, setNightIndex] = useState(0);
  const [passengerIndex, setPassengerIndex] = useState(0);
  const [focus, setFocus] = useState(3);
  const [trust, setTrust] = useState(3);
  const [contamination, setContamination] = useState(0);
  const [credits, setCredits] = useState(0);
  const [caught, setCaught] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [runBestStreak, setRunBestStreak] = useState(0);
  const [revealed, setRevealed] = useState<InvestigationKey[]>([]);
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [upgrades, setUpgrades] = useState<UpgradeId[]>([]);
  const [whistleUsed, setWhistleUsed] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [runs, setRuns] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [archiveIds, setArchiveIds] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const night = NIGHTS[nightIndex];
  const contract = CONTRACTS.find((item) => item.id === contractId) ?? CONTRACTS[0];
  const activePassengers = runRosters[nightIndex] ?? night.passengers;
  const passenger = activePassengers[passengerIndex];
  const maxFocus = contract.focus + (upgrades.includes("night-tea") ? 1 : 0);
  const maxTrust = contract.trust + (upgrades.includes("red-thread") ? 1 : 0);
  const rawScore = Math.max(0, credits + caught * 20 + trust * 10 - contamination * 15 - mistakes * 5);
  const score = Math.floor(rawScore * contract.multiplier);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as { bestScore?: number; runs?: number; bestStreak?: number; archiveIds?: string[]; soundOn?: boolean };
      // Hydration has to happen after mount because the archive lives in browser-only storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBestScore(stored.bestScore || 0);
      setRuns(stored.runs || 0);
      setBestStreak(stored.bestStreak || 0);
      setArchiveIds(Array.isArray(stored.archiveIds) ? stored.archiveIds : []);
      if (typeof stored.soundOn === "boolean") setSoundOn(stored.soundOn);
    } catch {
      // A damaged local record should never stop the train.
    }
  }, []);

  useEffect(() => {
    if (phase !== "ending") return;
    const nextBest = Math.max(bestScore, score);
    const nextRuns = runs + 1;
    const nextBestStreak = Math.max(bestStreak, runBestStreak);
    // The ending transition is the single persistence checkpoint for a completed run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBestScore(nextBest);
    setRuns(nextRuns);
    setBestStreak(nextBestStreak);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestScore: nextBest, runs: nextRuns, bestStreak: nextBestStreak, archiveIds, soundOn }));
    // Ending is entered once per run; the state reset prevents duplicate writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestScore, runs, bestStreak, archiveIds, soundOn }));
  }, [soundOn, bestScore, runs, bestStreak, archiveIds]);

  const availableUpgrades = useMemo(() => {
    const remaining = UPGRADES.filter((upgrade) => !upgrades.includes(upgrade.id));
    const offset = nightIndex === 0 ? 0 : 2;
    return [...remaining.slice(offset, offset + 3), ...remaining].slice(0, 3);
  }, [nightIndex, upgrades]);

  const actionCost = useCallback((key: InvestigationKey) => {
    if (key === "mirror" && upgrades.includes("silver-mirror")) return 0;
    return ACTIONS[key].cost;
  }, [upgrades]);

  const startRun = () => {
    playTone("tap", soundOn);
    setPhase("contract");
  };

  const chooseContract = (selected: DutyContract) => {
    playTone("good", soundOn);
    setContractId(selected.id);
    setRunRosters(createRunRosters());
    setNightIndex(0);
    setPassengerIndex(0);
    setFocus(selected.focus);
    setTrust(selected.trust);
    setContamination(selected.contamination);
    setCredits(0);
    setCaught(0);
    setMistakes(0);
    setStreak(0);
    setRunBestStreak(0);
    setRevealed([]);
    setResult(null);
    setUpgrades([]);
    setWhistleUsed(false);
    setPhase("briefing");
  };

  const beginNight = () => {
    playTone("tap", soundOn);
    setPassengerIndex(0);
    setFocus(maxFocus);
    setRevealed([]);
    setResult(null);
    setPhase("inspection");
  };

  const investigate = useCallback((key: InvestigationKey) => {
    if (phase !== "inspection" || revealed.includes(key)) return;
    const cost = actionCost(key);
    if (focus < cost) return;
    playTone("tap", soundOn);
    setFocus((value) => value - cost);
    setRevealed((items) => {
      const next = [...items, key];
      if (key === "ticket" && upgrades.includes("double-punch") && !next.includes("question")) next.push("question");
      return next;
    });
  }, [actionCost, focus, phase, revealed, soundOn, upgrades]);

  const makeVerdict = useCallback((decision: "allow" | "deny") => {
    if (phase !== "inspection") return;
    const correct = (decision === "deny") === passenger.isAnomaly;
    let nextTrust = trust;
    let nextContamination = contamination;
    let reward = 0;
    let nextStreak = 0;

    if (correct) {
      nextStreak = streak + 1;
      setRunBestStreak((value) => Math.max(value, nextStreak));
      reward = 12 + Math.min(nextStreak - 1, 4) * 3 + (upgrades.includes("old-ledger") ? 5 : 0);
      setStreak(nextStreak);
      setCredits((value) => value + reward);
      if (passenger.isAnomaly) setCaught((value) => value + 1);
      playTone("good", soundOn);
    } else {
      setStreak(0);
      setMistakes((value) => value + 1);
      if (passenger.isAnomaly) {
        if (upgrades.includes("brass-whistle") && !whistleUsed) {
          setWhistleUsed(true);
        } else {
          nextContamination += 1;
          setContamination(nextContamination);
        }
      } else {
        nextTrust -= 1;
        setTrust(nextTrust);
      }
      playTone("bad", soundOn);
    }

    const endCause = nextTrust <= 0 ? "trust" : nextContamination >= 3 ? "contamination" : undefined;
    const title = correct
      ? passenger.isAnomaly ? "拒载正确" : "准予乘车"
      : passenger.isAnomaly ? "异常已经上车" : "误拒普通乘客";
    const explanation = correct
      ? passenger.violation
      : passenger.isAnomaly
        ? `${passenger.violation} 你放行了它。`
        : `${passenger.violation} 你拒绝了一位符合规定的乘客。`;

    setArchiveIds((items) => items.includes(passenger.id) ? items : [...items, passenger.id]);
    setResult({ correct, decision, passenger, title, explanation, reward, streak: nextStreak, endCause });
    setPhase("result");
  }, [contamination, passenger, phase, soundOn, streak, trust, upgrades, whistleUsed]);

  const continueAfterResult = () => {
    playTone("tap", soundOn);
    if (result?.endCause) {
      setPhase("ending");
      return;
    }
    const isLastPassenger = passengerIndex === activePassengers.length - 1;
    if (isLastPassenger) {
      if (nightIndex === NIGHTS.length - 1) setPhase("ending");
      else setPhase("shift-end");
      return;
    }
    setPassengerIndex((value) => value + 1);
    setFocus(maxFocus);
    setRevealed([]);
    setResult(null);
    setPhase("inspection");
  };

  const chooseUpgrade = (upgrade: Upgrade) => {
    playTone("good", soundOn);
    setUpgrades((items) => [...items, upgrade.id]);
    if (upgrade.id === "red-thread") setTrust((value) => value + 1);
    const nextNight = nightIndex + 1;
    setNightIndex(nextNight);
    setPassengerIndex(0);
    setFocus(contract.focus + (upgrade.id === "night-tea" || upgrades.includes("night-tea") ? 1 : 0));
    setRevealed([]);
    setResult(null);
    setPhase("briefing");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== "inspection") return;
      const keyMap: Record<string, InvestigationKey> = { "1": "ticket", "2": "mirror", "3": "question", "4": "pulse", "5": "bag" };
      if (keyMap[event.key]) investigate(keyMap[event.key]);
      if (event.key.toLowerCase() === "a") makeVerdict("allow");
      if (event.key.toLowerCase() === "d") makeVerdict("deny");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [investigate, makeVerdict, phase]);

  const ending = useMemo(() => {
    if (trust <= 0) return { mark: "×", kicker: "人事科 · 即时通知", title: "你的检票钳被收走了", body: "误拒不断累积。站长没有责骂你，只让你交回制服。雨棚下仍有人等着一辆不会再由你检票的车。" };
    if (contamination >= 3) return { mark: "13", kicker: "未登记终点", title: "列车驶入第十三站", body: "车窗外的站牌一个接一个熄灭。你终于明白，异常不需要占满整节车厢——三个就足够替列车选择新的终点。" };
    if (mistakes === 0) return { mark: "✓", kicker: "零点四十七分 · 准点", title: "今夜没有多出一位乘客", body: "终雾站的灯在前方亮起。你合上名册，发现最后一页多了一行小字：谢谢你还记得活人的方向。" };
    return { mark: "◎", kicker: "终雾站 · 清晨将至", title: "末班车仍回到了正确线路", body: "有些判断会在很久以后继续敲打你。但车门打开时，站台是熟悉的站台，晨雾中传来了第一班车的铃声。" };
  }, [contamination, mistakes, trust]);

  return (
    <main className="game-shell">
      <div className="night-scenery" aria-hidden="true">
        <div className="passing-light light-one" />
        <div className="passing-light light-two" />
        <div className="rain-layer" />
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => setPhase("title")} aria-label="返回游戏首页">
          <span className="brand-seal">13</span>
          <span><b>末班车</b><small>十三号站</small></span>
        </button>
        <div className="top-actions">
          {phase !== "title" && <span className="run-score">夜班记录 <b>{score}</b></span>}
          <button className="icon-button" onClick={() => setShowArchive(true)}>乘客档案</button>
          <button className="icon-button" onClick={() => setShowGuide(true)}>值班手册</button>
          <button className="icon-button sound-button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "关闭声音" : "开启声音"}>{soundOn ? "声 · 开" : "声 · 关"}</button>
        </div>
      </header>

      {phase === "title" && (
        <section className="title-screen">
          <div className="title-copy">
            <div className="eyebrow"><span /> 规则推理卡牌游戏</div>
            <h1>零点之后，<br /><em>不要放错任何人。</em></h1>
            <p className="lead">二十四位可能出现的乘客，每次值班随机遇见十二位。检查车票、倒影与心跳，在末班车驶入浓雾前，决定谁能上车。</p>
            <div className="title-buttons">
              <button className="primary-button" onClick={startRun}><span>开始今晚值班</span><b>→</b></button>
              <button className="secondary-button" onClick={() => setShowArchive(true)}>查看本机档案</button>
            </div>
            <div className="record-strip">
              <div><small>历史最高</small><strong>{bestScore || "—"}</strong></div>
              <div><small>完成夜班</small><strong>{runs}</strong></div>
              <div><small>最佳连判</small><strong>{bestStreak || "—"}</strong></div>
              <div><small>档案收录</small><strong>{archiveIds.length} / {ALL_PASSENGERS.length}</strong></div>
            </div>
          </div>
          <div className="title-art" aria-label="一张等待查验的神秘乘客卡">
            <div className="route-line"><span>白榆路</span><i /><span>终雾站</span><i className="lost" /><span>？</span></div>
            <div className="sample-card-wrap">
              <div className="sample-card-shadow" />
              <article className="sample-card">
                <div className="card-topline"><span>夜行乘车证</span><b>NO. 0719-00</b></div>
                <div className="sample-portrait"><span>？</span><i /></div>
                <p className="sample-label">旅客姓名</p>
                <h2>尚未登记</h2>
                <div className="sample-route"><span>来处不详</span><b>→</b><span>十三号站</span></div>
                <div className="sample-stamp">待查验</div>
              </article>
            </div>
            <p className="art-caption"><span>提示</span> 异常也会说真话，只是不会说出全部。</p>
          </div>
        </section>
      )}

      {phase === "contract" && (
        <section className="contract-screen content-screen">
          <div className="upgrade-heading">
            <span className="section-kicker">终雾线 · 夜班调度室</span>
            <h1>签署值班契约</h1>
            <p>难度越高，可用于调查的余地越少，但最终记录也会获得更高倍率。</p>
          </div>
          <div className="contract-grid">
            {CONTRACTS.map((item) => (
              <button className={`contract-card ${item.id === "standard" ? "recommended" : ""}`} key={item.id} onClick={() => chooseContract(item)}>
                {item.id === "standard" && <span className="recommended-label">推荐</span>}
                <b className="contract-mark">{item.mark}</b>
                <small>{item.subtitle}</small>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <div className="contract-stats"><span>专注 <b>{item.focus}</b></span><span>信誉 <b>{item.trust}</b></span><span>记录 <b>×{item.multiplier.toFixed(1)}</b></span></div>
                <span className="choose-label">签署此契约 <b>→</b></span>
              </button>
            ))}
          </div>
          <button className="text-button contract-back" onClick={() => setPhase("title")}>返回值班大厅</button>
        </section>
      )}

      {phase === "briefing" && (
        <section className="briefing-screen content-screen">
          <div className="briefing-heading">
            <div>
              <span className="section-kicker">值班开始 · {night.time}</span>
              <h1>{night.label}</h1>
              <p>{night.subtitle}</p>
            </div>
            <div className="weather-card"><small>{contract.name} · 记录 ×{contract.multiplier.toFixed(1)}</small><strong>{night.weather}</strong><span>本夜随机编组 {activePassengers.length} 人</span></div>
          </div>
          <div className="rules-board">
            <div className="board-title"><span>本夜临时乘车规则</span><small>规则每晚更换，请勿沿用昨日经验</small></div>
            <div className="rule-grid">
              {night.rules.map((rule) => (
                <article className="rule-card" key={rule.mark}>
                  <span className="rule-number">{rule.mark}</span>
                  <div><h3>{rule.title}</h3><p>{rule.detail}</p></div>
                </article>
              ))}
            </div>
          </div>
          {upgrades.length > 0 && (
            <div className="equipped-row"><span>本局已装备</span>{upgrades.map((id) => { const item = UPGRADES.find((upgrade) => upgrade.id === id)!; return <span className="mini-upgrade" key={id}>{item.mark} {item.name}</span>; })}</div>
          )}
          <button className="primary-button centered" onClick={beginNight}><span>记住规则，开始检票</span><b>→</b></button>
        </section>
      )}

      {(phase === "inspection" || phase === "result") && (
        <section className="inspection-screen content-screen">
          <div className="shift-status">
            <div className="night-progress">
              <span>{night.label} · {night.time}</span>
              <div className="progress-dots">{activePassengers.map((item, index) => <i key={item.id} className={index < passengerIndex ? "done" : index === passengerIndex ? "current" : ""} />)}</div>
              <small>第 {passengerIndex + 1} / {activePassengers.length} 位</small>
            </div>
            <div className="status-meters">
              <div><span>公众信誉</span><b className="trust-pips">{Array.from({ length: maxTrust }, (_, index) => <i key={index} className={index < trust ? "filled" : ""}>◆</i>)}</b></div>
              <div><span>车厢污染</span><b className="contamination-pips">{[0, 1, 2].map((index) => <i key={index} className={index < contamination ? "filled" : ""}>●</i>)}</b></div>
            </div>
          </div>

          <div className="inspection-layout">
            <aside className="active-rules">
              <div className="panel-label">今夜规则</div>
              {night.rules.map((rule) => <div className="compact-rule" key={rule.mark}><b>{rule.mark}</b><p><strong>{rule.title}</strong><span>{rule.detail}</span></p></div>)}
              <div className="decision-tip"><span>判定原则</span><p>违反任意一条规则即可拒载；可疑不等于违规。</p></div>
            </aside>

            <article className="passenger-card" style={{ "--passenger-color": passenger.color } as React.CSSProperties}>
              <div className="ticket-edge left-edge" aria-hidden="true" />
              <div className="passenger-head">
                <span>夜行乘车证</span><b>NO. {passenger.number}</b>
              </div>
              <div className="identity-row">
                <div className="portrait-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${ASSET_PREFIX}/passengers/${passenger.id}.jpg`} alt={`${passenger.name}的乘车档案照`} />
                  <small>临时照片</small>
                </div>
                <div className="identity-copy"><small>乘客姓名 / 年龄</small><h2>{passenger.name}</h2><p>{passenger.age} 岁 · 自称普通乘客</p><div className="signature">{passenger.quote}</div></div>
              </div>
              <div className="route-block">
                <div><small>上车地点</small><strong>{passenger.from}</strong></div><span className="route-arrow">→</span><div><small>目的地</small><strong>{passenger.destination}</strong></div>
              </div>
              <div className="visible-details"><div><small>票种</small><strong>{passenger.ticket}</strong></div><div><small>申报行李</small><strong>{passenger.baggage}</strong></div></div>
              <div className="findings-area">
                <div className="findings-title"><span>调查记录</span><small>{revealed.length === 0 ? "尚未使用行动牌" : `已获得 ${revealed.length} 条信息`}</small></div>
                <div className="finding-list">
                  {revealed.length === 0 && <div className="empty-finding"><span>＋</span> 从下方选择行动牌以核验乘客</div>}
                  {revealed.map((key) => { const finding = passenger.findings[key]; return <div className={`finding ${finding.tone}`} key={key}><b>{ACTIONS[key].mark}</b><p><strong>{finding.label}</strong><span>{finding.text}</span></p></div>; })}
                </div>
              </div>
              <div className="ticket-barcode" aria-hidden="true">|||| ||| | |||| | | ||| ||</div>
            </article>

            <aside className="decision-panel">
              <div className="panel-label">最终处置</div>
              <p>调查后，根据本夜规则作出决定。提交后无法撤回。</p>
              <div className="decision-buttons">
                <button className="allow-button" onClick={() => makeVerdict("allow")} disabled={phase === "result"}><span>准予乘车</span><small>A 键</small></button>
                <button className="deny-button" onClick={() => makeVerdict("deny")} disabled={phase === "result"}><span>拒绝上车</span><small>D 键</small></button>
              </div>
              <div className="salary-box"><span>本夜津贴 · 连判 {streak}</span><strong>¥ {credits}</strong><small>{streak >= 2 ? `连判奖励已提高至 +${Math.min(streak - 1, 4) * 3}` : "连续正确判断可提高每次津贴"}</small></div>
            </aside>
          </div>

          <div className="action-dock">
            <div className="focus-counter"><span>本次专注</span><b>{focus}<small> / {maxFocus}</small></b><p>行动牌仅对当前乘客有效</p></div>
            <div className="action-hand">
              {(Object.keys(ACTIONS) as InvestigationKey[]).map((key, index) => {
                const action = ACTIONS[key]; const cost = actionCost(key); const used = revealed.includes(key); const unavailable = focus < cost || phase === "result";
                return <button key={key} className={`action-card ${used ? "used" : ""}`} onClick={() => investigate(key)} disabled={used || unavailable}>
                  <span className="key-hint">{index + 1}</span><b className="action-mark">{action.mark}</b><strong>{action.name}</strong><small>{action.hint}</small><i>{used ? "已使用" : `${cost} 专注`}</i>
                </button>;
              })}
            </div>
          </div>

          {phase === "result" && result && (
            <div className="result-overlay" role="dialog" aria-modal="true" aria-label="检票结果">
              <div className={`result-card ${result.correct ? "correct" : "wrong"}`}>
                <span className="result-mark">{result.correct ? "✓" : "×"}</span>
                <small>{result.decision === "allow" ? "已盖准乘章" : "已盖拒载章"}</small>
                <h2>{result.title}</h2>
                <p>{result.explanation}</p>
                <blockquote>{result.passenger.farewell}</blockquote>
                <div className="result-impact">
                  {result.correct ? <span className="positive">连判 {result.streak} · 夜班津贴 +{result.reward}</span> : result.passenger.isAnomaly ? <span className="negative">连判中断 · 车厢污染上升</span> : <span className="negative">连判中断 · 公众信誉下降</span>}
                </div>
                <button className="primary-button centered" onClick={continueAfterResult}><span>{result.endCause ? "查看夜班结局" : passengerIndex === activePassengers.length - 1 ? "结束本夜检票" : "呼叫下一位乘客"}</span><b>→</b></button>
              </div>
            </div>
          )}
        </section>
      )}

      {phase === "shift-end" && (
        <section className="upgrade-screen content-screen">
          <div className="upgrade-heading"><span className="section-kicker">{night.label}结束 · 临时休息室</span><h1>留下一张值班牌</h1><p>站长允许你从失物柜中选取一件物品。它将在之后的夜晚持续生效。</p></div>
          <div className="upgrade-grid">
            {availableUpgrades.map((upgrade) => (
              <button className="upgrade-card" key={upgrade.id} onClick={() => chooseUpgrade(upgrade)}>
                <span className="upgrade-kicker">{upgrade.kicker}</span><b className="upgrade-mark">{upgrade.mark}</b><h2>{upgrade.name}</h2><p>{upgrade.description}</p><span className="choose-label">选择此牌 <b>→</b></span>
              </button>
            ))}
          </div>
          <div className="shift-summary"><span>当前记录 <b>{score}</b></span><span>正确拦截 <b>{caught}</b></span><span>剩余信誉 <b>{trust}</b></span><span>车厢污染 <b>{contamination} / 3</b></span></div>
        </section>
      )}

      {phase === "ending" && (
        <section className="ending-screen content-screen">
          <div className="ending-ticket">
            <div className="ending-mark">{ending.mark}</div>
            <span className="section-kicker">{ending.kicker}</span>
            <h1>{ending.title}</h1>
            <p>{ending.body}</p>
            <div className="final-score"><small>本次夜班记录</small><strong>{score}</strong><span>{score >= bestScore ? "本机最佳记录" : `历史最佳 ${bestScore}`}</span></div>
            <div className="ending-stats"><div><small>拦截异常</small><b>{caught} / 6</b></div><div><small>最佳连判</small><b>{runBestStreak}</b></div><div><small>{contract.name}倍率</small><b>×{contract.multiplier.toFixed(1)}</b></div></div>
            <button className="primary-button centered" onClick={startRun}><span>重新开始一班</span><b>↻</b></button>
            <button className="text-button" onClick={() => setPhase("title")}>返回标题画面</button>
          </div>
        </section>
      )}

      {showArchive && (
        <div className="guide-overlay" role="dialog" aria-modal="true" aria-label="乘客档案">
          <div className="archive-book">
            <button className="close-button" onClick={() => setShowArchive(false)} aria-label="关闭乘客档案">×</button>
            <div className="archive-heading">
              <div><span className="section-kicker">终雾线 · 本机调查记录</span><h2>乘客档案</h2><p>完成一次处置即可收录人物真相。每夜会从八位候选者中随机出现四位。</p></div>
              <div className="archive-count"><strong>{archiveIds.length}</strong><span>/ {ALL_PASSENGERS.length}<small>已收录</small></span></div>
            </div>
            <div className="archive-grid">
              {ALL_PASSENGERS.map((item, index) => {
                const unlocked = archiveIds.includes(item.id);
                return <article className={`archive-card ${unlocked ? "unlocked" : "locked"}`} key={item.id} style={{ "--passenger-color": item.color } as React.CSSProperties}>
                  <div className="archive-number">{String(index + 1).padStart(2, "0")}</div>
                  <div className="archive-monogram">{unlocked ? <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${ASSET_PREFIX}/passengers/${item.id}.jpg`} alt={`${item.name}的档案照`} />
                  </> : "?"}</div>
                  <small>{unlocked ? (item.isAnomaly ? "异常档案" : "普通乘客") : "尚未登记"}</small>
                  <h3>{unlocked ? item.name : "未知乘客"}</h3>
                  {unlocked ? <><p>{item.from} → {item.destination}</p><span>{item.violation}</span></> : <p>继续值班以发现此人</p>}
                </article>;
              })}
            </div>
            <p className="archive-note">档案仅保存在当前浏览器中，不包含账号或个人信息。</p>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="guide-overlay" role="dialog" aria-modal="true" aria-label="值班手册">
          <div className="guide-book">
            <button className="close-button" onClick={() => setShowGuide(false)} aria-label="关闭值班手册">×</button>
            <span className="section-kicker">终雾线 · 夜间岗位须知</span>
            <h2>值班手册</h2>
            <div className="guide-steps">
              <div><b>01</b><p><strong>先读本夜规则</strong><span>规则每夜更换，上一夜的禁令可能不再有效。</span></p></div>
              <div><b>02</b><p><strong>使用行动牌调查</strong><span>专注点数由值班契约决定。可疑信息并不一定构成违规。</span></p></div>
              <div><b>03</b><p><strong>作出最终处置</strong><span>放行异常会增加污染；误拒普通乘客会损失信誉。</span></p></div>
              <div><b>04</b><p><strong>保住这趟列车</strong><span>信誉归零或污染达到 3 点，夜班将提前结束。</span></p></div>
              <div><b>05</b><p><strong>维持连续判断</strong><span>连续正确会逐步提高夜班津贴，失误将令连判归零。</span></p></div>
            </div>
            <div className="shortcut-line"><span>键盘快捷键</span><b>1–5 调查</b><b>A 放行</b><b>D 拒载</b></div>
            <button className="primary-button centered" onClick={() => setShowGuide(false)}><span>合上手册</span><b>✓</b></button>
          </div>
        </div>
      )}
    </main>
  );
}
