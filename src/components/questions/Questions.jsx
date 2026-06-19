import React from "react";
import questions from "../../data/questions";

export default function Questions() {
  return (
    <section id="questions" className="container-page py-16 lg:py-[148px]">
      <div className="reveal max-w-[1040px]">
        <h2 className="text-[34px] font-medium leading-tight text-ink sm:text-[40px]">
          Common Questions
        </h2>
        <div className="mt-[56px] space-y-10">
          {questions.map((question) => (
            <article key={question.title}>
              <h3 className="text-[19px] font-semibold leading-[35px] text-ink">
                {question.title}
              </h3>
              <p className="mt-2 text-[17px] leading-8 text-ink/60">
                {question.body}
              </p>
            </article>
          ))}
        </div>
        <a href="#top" className="outline-button mt-12">
          More Questions
        </a>
      </div>
    </section>
  );
}
