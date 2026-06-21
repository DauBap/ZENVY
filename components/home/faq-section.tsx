'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faqData } from '@/lib/data'

export function FAQSection() {
  return (
    <section id="faq" className="py-16 lg:py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Câu hỏi <span className="gradient-text">thường gặp</span>
          </h2>
          <p className="text-muted-foreground">
            Những thắc mắc phổ biến về dịch vụ của chúng tôi
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm px-6 data-[state=open]:border-purple-500/30 data-[state=open]:bg-purple-500/5 transition-all"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-purple-300 hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Không tìm thấy câu trả lời bạn cần?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
          >
            Liên hệ hỗ trợ →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
