import { AIService } from "@/backend/services/AIService";
import { AgentService } from "@/backend/services/AgentService";
import { FlowBuilder } from "@/backend/core/FlowBuilder";
import { FlowAdapter } from "@/backend/core/FlowAdapter";
import { FlowContext } from "@/backend/types/flow";

export const runtime = "edge";

const agentFlow = new FlowBuilder()
  .name("دستیار هوشمند")
  .description(
    "یک دستیار هوشمند که سوالات را به صورت ساختاریافته پردازش می‌کند"
  )
  .addStep({
    name: "تحلیل",
    description: "تحلیل و برنامه‌ریزی پاسخ",
    type: "sequential",
    execute: async (input: string, { sendMessage, messageId }: FlowContext) => {
      console.log("Analysis input:", input);
      await sendMessage("status", "در حال ایجاد برنامه...", messageId);

      const question = typeof input === "string" ? input : "";

      const plan = await AIService.generateStream(
        question,
        "شما یک دستیار برنامه‌ریز هستید. درخواست کاربر را به مراحل روشن و قابل اجرا تقسیم کنید.",
        `برای پاسخ به این سوال یک برنامه دقیق ایجاد کنید: "${question}"`,
        "generate plan",
        async (chunk) => {
          await sendMessage("plan", chunk, messageId);
        }
      );

      const result = { question, plan };
      console.log("Analysis output:", result);
      return result;
    },
    outputProcessor: (output: any) => {
      console.log("Analysis outputProcessor input:", output);
      if (!output || typeof output !== "object") {
        return { question: "", plan: "" };
      }
      const processed = {
        question: output.question || "",
        plan: output.plan || "",
      };
      console.log("Analysis outputProcessor output:", processed);
      return processed;
    },
    statusMessage: "در حال تحلیل درخواست شما...",
  })
  .goalBased(
    "پاسخ",
    "تولید و بهبود پاسخ تا رسیدن به استانداردهای کیفی",
    async (
      input:
        | { question: string; plan: string }
        | {
            question: string;
            response: string;
            evaluation?: string;
            plan?: string;
          },
      { sendMessage, messageId }: FlowContext
    ) => {
      console.log("Response execute input:", input);

      const generateUniqueId = () => `${messageId}-${Date.now()}`;

      if (typeof input === "string") {
        throw new Error("ورودی باید یک آبجکت شامل سوال و برنامه باشد.");
      }

      const question = input.question || "";

      if ("response" in input && input.evaluation) {
        const refinementId = generateUniqueId();
        await sendMessage("status", "در حال بهبود پاسخ...", refinementId);
        const refinedResponse = await AIService.generateStream(
          `${question}\n${input.response}`,
          "شما یک دستیار بهبود‌دهنده هستید. پاسخ فعلی را تحلیل کرده و بر اساس پیشنهادات بهبود، آن را ارتقا دهید.",
          `سوال اصلی: "${question}"\nپاسخ فعلی: ${input.response}\nپیشنهادات بهبود: ${input.evaluation}\n\nاین پاسخ را با حفظ ساختار و اعمال پیشنهادات بهبود، ارتقا دهید.`,
          "generate refinement",
          async (chunk) => {
            await sendMessage("refinement", chunk, refinementId);
          }
        );

        const evaluationId = generateUniqueId();
        await sendMessage(
          "status",
          "در حال ارزیابی پاسخ بهبود یافته...",
          evaluationId
        );
        const evaluation = await AIService.generateStream(
          refinedResponse,
          `شما یک ارزیاب بسیار سخت‌گیر هستید. استانداردهای شما بسیار بالاست - فقط پاسخ‌های کامل قبول می‌شوند. وظیفه شما تحلیل پاسخ‌ها بر اساس ۱۰ معیار دقیق است. برای هر معیار، تمام موارد چک‌لیست باید ۱۰۰٪ رعایت شده باشند تا علامت ✓ بگیرد. حتی یک نقص کوچک هم باعث رد شدن می‌شود:

۱. جامعیت
   □ پوشش کامل تمام جنبه‌های سوال با جزئیات کامل
   □ پوشش تمام موارد خاص، استثناها و حالت‌های مرزی
   □ شامل اطلاعات زمینه‌ای و بافت کامل
   □ پیش‌بینی و پاسخ به تمام سوالات احتمالی
   □ هیچ اطلاعات مرتبطی، حتی جزئی، از قلم نیفتاده باشد

۲. صحت
   □ تمام حقایق با منابع معتبر قابل تایید باشند
   □ تمام اصطلاحات فنی با دقت کامل استفاده شده باشند
   □ هیچ ساده‌سازی یا کلی‌گویی، حتی جزئی، وجود نداشته باشد
   □ تمام ادعاها با ارجاعات مشخص پشتیبانی شده باشند
   □ هیچ خطا، ابهام یا عبارت گمراه‌کننده‌ای وجود نداشته باشد

۳. ساختار
   □ سازماندهی سلسله‌مراتبی کامل با بخش‌ها و زیربخش‌های مشخص
   □ پیشرفت منطقی ایده‌ها بدون هیچ شکافی
   □ استفاده حرفه‌ای و یکدست از تیترها در تمام سطوح
   □ قالب‌بندی بی‌نقص در کل متن
   □ استفاده بهینه از لیست‌ها، پاراگراف‌ها و سازماندهی بصری

۴. وضوح
   □ هر جمله کاملاً شفاف و بدون امکان تفسیر اشتباه
   □ تمام اصطلاحات فنی با مثال توضیح داده شده‌اند
   □ هیچ اصطلاح تخصصی بدون توضیح وجود ندارد
   □ استفاده کامل از جملات معلوم و زبان مستقیم
   □ کاملاً موجز در عین حفظ تمام اطلاعات

۵. کاربردی بودن
   □ دستورالعمل‌های گام به گام دقیق برای هر مورد اجرایی
   □ لیست کامل پیش‌نیازها و الزامات
   □ ابزارها، منابع و روش‌ها با جزئیات دقیق نسخه/مشخصات
   □ تمام مشکلات احتمالی با راه‌حل مشخص شده‌اند
   □ معیارهای موفقیت و روش‌های اعتبارسنجی برای هر مرحله

۶. مثال‌ها
   □ مثال‌های متنوع و دقیق متعدد برای هر نکته اصلی
   □ تمام مثال‌ها کاملاً مرتبط و قابل اجرا هستند
   □ هر مفهوم با یک مثال عملی توضیح داده شده
   □ پوشش کامل سناریوهای موفقیت و شکست
   □ نمونه کدهای دقیق با توضیحات در صورت نیاز

۷. بافت
   □ تطبیق کامل با سطح تخصص کاربر بدون هیچ پیش‌فرضی
   □ تمام محدودیت‌های محیطی و موانع در نظر گرفته شده‌اند
   □ زمان، منابع و مهارت‌های مورد نیاز دقیقاً مشخص شده‌اند
   □ مقایسه کامل تمام رویکردهای جایگزین
   □ تحلیل مقیاس‌پذیری برای سناریوهای مختلف

۸. سطح جزئیات
   □ عمق مناسب برای هر نکته بدون هیچ شکافی
   □ تمام مفاهیم پیچیده به اجزای ساده تقسیم شده‌اند
   □ جزئیات پشتیبان کامل بدون هیچ حذفی
   □ هیچ اطلاعات نامربوط یا حاشیه‌ای وجود ندارد
   □ تعادل کامل بین جامعیت و قابل فهم بودن

۹. انسجام
   □ انتقال روان بین تمام بخش‌ها
   □ جریان منطقی کامل با پیشرفت طبیعی ایده‌ها
   □ هیچ تناقض یا ناسازگاری، حتی جزئی، وجود ندارد
   □ روابط واضح و صریح بین تمام مفاهیم
   □ حفظ کامل تمرکز در کل متن

۱۰. جذابیت
    □ تعادل کامل بین لحن حرفه‌ای و قابل فهم
    □ تنوع استادانه در ساختار و طول جملات
    □ زبان فعال و جذاب در کل متن
    □ استفاده حرفه‌ای از تاکید و برجسته‌سازی نکات کلیدی
    □ حفظ علاقه مخاطب از ابتدا تا انتها

فقط در صورتی که تمام موارد چک‌لیست یک معیار با دقت ۱۰۰٪ رعایت شده باشند، علامت ✓ بدهید. حتی یک نقص کوچک هم باعث علامت ✗ می‌شود. بسیار سخت‌گیر باشید - اگر کوچکترین تردیدی دارید، علامت ✗ بدهید.

پاسخ خود را به این شکل قالب‌بندی کنید:

[ارزیابی معیارها]
۱. جامعیت: ✓ یا ✗
   - تحلیل دقیق هر مورد چک‌لیست
   - مثال‌های مشخص از پاسخ برای هر مورد
   - توضیح واضح برای هر ✗ با نقل قول دقیق

[ادامه این قالب برای تمام ۱۰ معیار]

[نمره]
X/10 (X تعداد ✓ها است)

[پیشنهادات]
برای هر معیار ✗:
۱. لیست تمام موارد چک‌لیست رد شده با مثال‌های مشخص
۲. نقل قول دقیق موارد ناقص یا نامناسب
۳. نمونه‌های دقیق پیاده‌سازی بهبودها`,
          `سوال اصلی: "${question}"\nپاسخ فعلی: ${refinedResponse}\n\nلطفاً یک ارزیابی دقیق طبق قالب بالا ارائه دهید.`,
          "evaluate response",
          async (chunk) => {
            await sendMessage("evaluation", chunk, evaluationId);
          }
        );

        return {
          question,
          response: refinedResponse,
          evaluation,
          messageId: refinementId,
          evaluationId,
        };
      }

      if (!("plan" in input)) {
        throw new Error("برنامه برای تولید پاسخ اولیه الزامی است");
      }

      const responseId = generateUniqueId();
      await sendMessage("status", "در حال تولید پاسخ...", responseId);
      const response = await AIService.generateStream(
        question,
        "شما یک دستیار دانا هستید. پاسخ‌های دقیق و کامل ارائه دهید.",
        `سوال: "${question}"\nبرنامه: ${input.plan}\n\nلطفاً یک پاسخ جامع طبق این برنامه ارائه دهید.`,
        "generate response",
        async (chunk) => {
          await sendMessage("result", chunk, responseId);
        }
      );

      const maxAttempts = 3;
      let attempts = 0;

      const evaluationId = generateUniqueId();
      await sendMessage("status", "در حال ارزیابی پاسخ...", evaluationId);

      const evaluation = await AIService.generateStream(
        response,
        `شما یک ارزیاب بسیار سخت‌گیر هستید. استانداردهای شما بسیار بالاست - فقط پاسخ‌های کامل قبول می‌شوند.`,
        `سوال اصلی: "${question}"
پاسخ فعلی: ${response}

لطفاً پاسخ را بر اساس معیارهای زیر ارزیابی کنید:

[CRITERIA EVALUATION]
1. کامل بودن: آیا تمام جنبه‌های سوال پوشش داده شده‌اند؟
2. دقت: آیا اطلاعات ارائه شده دقیق و صحیح هستند؟
3. ساختار: آیا پاسخ ساختار منطقی و منسجمی دارد؟
4. وضوح: آیا پاسخ به زبان ساده و قابل فهم بیان شده است؟
5. کاربردی بودن: آیا پاسخ راه‌حل‌های عملی و قابل اجرا ارائه می‌دهد؟
6. مثال‌ها: آیا از مثال‌های مناسب برای روشن‌تر شدن موضوع استفاده شده است؟
7. زمینه: آیا زمینه و شرایط لازم برای درک بهتر توضیح داده شده‌اند؟
8. جزئیات: آیا جزئیات کافی برای درک عمیق موضوع ارائه شده است؟
9. انسجام: آیا ارتباط منطقی بین بخش‌های مختلف پاسخ وجود دارد؟
10. جذابیت: آیا پاسخ به شکلی جذاب و درگیرکننده ارائه شده است؟

برای هر معیار، لطفاً با ✓ یا ✗ مشخص کنید و توضیح مختصری بدهید.

[SCORE]
لطفاً نمره نهایی را در این فرمت دقیق بنویسید:
[Final Score: X/10]

[SUGGESTIONS]
اگر نمره کمتر از 7 است، لطفاً پیشنهادهای دقیق برای بهبود ارائه دهید.`,
        "evaluate response",
        async (chunk) => {
          await sendMessage("evaluation", chunk, evaluationId);
        }
      );

      attempts++;

      let completionReason = "";
      if (attempts >= maxAttempts) {
        completionReason = "حداکثر تعداد تلاش‌های بهبود به پایان رسید.";
      } else {
        completionReason = "پاسخ به کیفیت مطلوب رسید و نیازی به بهبود نداشت.";
      }

      return {
        question,
        response,
        evaluation,
        messageId: responseId,
        evaluationId,
        completionReason,
        attempts,
      };
    },
    async (
      result: {
        question: string;
        response: string;
        evaluation: string;
        messageId: string;
        evaluationId: string;
        completionReason: string;
        attempts: number;
      },
      { sendMessage, messageId }: FlowContext
    ) => {
      console.log("Response evaluator input:", result);

      const scoreMatch = result.evaluation.match(/\[نمره\]\s*(\d+)\/10/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

      console.log("Response evaluator output:", {
        score,
        evaluation: result.evaluation,
      });

      return score >= 10;
    },
    3,
    "در حال تولید و بهبود پاسخ...",
    (output: any) => {
      console.log("Response outputProcessor input:", output);
      if (!output || typeof output !== "object") {
        return {
          question: "",
          response: "",
          evaluation: "",
          messageId: "",
          evaluationId: "",
          completionReason: "",
          attempts: 0,
        };
      }
      return {
        question: output.question || "",
        response: output.response || "",
        evaluation: output.evaluation || "",
        messageId: output.messageId || "",
        evaluationId: output.evaluationId || "",
        completionReason: output.completionReason || "",
        attempts: output.attempts || 0,
      };
    }
  )
  .onError(async (error) => `خطا در پردازش درخواست: ${error.message}`)
  .build();

export async function POST(request: Request) {
  const { userPrompt } = await request.json();
  if (!userPrompt) return new Response("Missing user prompt", { status: 400 });

  const { stream, executor } = AgentService.createAgentExecutor();
  executor.executeFlow(FlowAdapter.toAgentFlow(agentFlow), userPrompt);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
