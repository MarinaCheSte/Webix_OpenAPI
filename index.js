webix.ui({
  view: "layout",
  type: "wide",
  padding: 20,
  rows: [
    {
      cols: [
        {
          view: "form",
          id: "ttsForm",
          width: 400,
          autoheight: false,
          elementsConfig: {
            labelWidth: 140,
            labelPosition: "top",
            bottomPadding: 20,
          },
          elements: [
            {
              view: "textarea",
              id: "textInput",
              label: "Text to Convert",
              height: 100,
              name: "text",
            },
            {
              view: "select",
              id: "voiceSelect",
              label: "Voice",
              name: "voice",
              options: [
                { id: "coral", value: "Coral (Female)" },
                { id: "alloy", value: "Alloy (Neutral)" },
                { id: "echo", value: "Echo (Male)" },
                { id: "sage", value: "Sage (Neutral)" },
                { id: "verse", value: "Verse (Male)" },
              ],
            },
            {
              view: "textarea",
              id: "instructionInput",
              label: "Conversion Instructions",
              placeholder: "e.g., Speak slowly, Sound enthusiastic",
              height: 80,
              name: "instructions",
            },
            {
              cols: [
                {
                  view: "button",
                  id: "convertBtn",
                  value: "Convert",
                  css: "webix_primary",
                  click: function () {
                    if ($$("ttsForm").validate()) {
                      convertTextToSpeech();
                    }
                  },
                },
                {
                  view: "button",
                  id: "clearBtn",
                  value: "Clear",
                  click: function () {
                    $$("ttsForm").clear();
                    $$("ttsForm").clearValidation();
                  },
                },
              ],
            },
            {
              rows: [
                {
                  view: "template",
                  id: "playerContainer",
                  autoheight: true,
                  borderless: true,
                  template: `<audio id="audioPlayer" controls style="width:100%;"></audio>`,
                },
              ],
            },
          ],
          rules: {
            text: webix.rules.isNotEmpty,
            voice: webix.rules.isNotEmpty,
          },
        },
        {
          view: "datatable",
          id: "historyTable",
          autoConfig: false,
          columns: [
            {
              id: "timestamp",
              header: "Timestamp",
              width: 150,
              format: webix.Date.dateToStr("%M %d, %H:%i"),
              resize: true,
            },
            {
              id: "preview",
              header: "Text Preview",
              fillspace: true,
              resize: true,
            },
            { id: "voice", header: "Voice", width: 100, resize: true },
            {
              id: "play",
              header: "Play",
              width: 80,
              template: `<button class='playBtn webix_button' style="height:80%; margin:2px">Play</button>`,
            },
          ],
          data: historyCollection,
          onClick: {
            playBtn: function (e, id) {
              const button = e.target;
              playAudio(id, button);
            },
          },
        },
      ],
    },
    {
      view: "template",
      id: "statusBar",
      template: "",
      height: 30,
      css: "status_bar",
    },
  ],
});
