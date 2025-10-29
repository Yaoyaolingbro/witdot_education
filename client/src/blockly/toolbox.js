/**
 * Blockly 工具箱配置
 * 定义学生可以使用的所有积木分类
 */

export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🤖 AI 功能',
      colour: 270,
      contents: [
        {
          kind: 'block',
          type: 'ai_image_recognition',
          inputs: {
            IMAGE: {
              shadow: {
                type: 'io_upload_image'
              }
            },
            PROMPT: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '请描述这张图片的内容'
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'ai_text_generate',
          inputs: {
            PROMPT: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '写一个小故事'
                }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '📺 输入输出',
      colour: 160,
      contents: [
        {
          kind: 'block',
          type: 'io_upload_image'
        },
        {
          kind: 'block',
          type: 'io_display_result',
          inputs: {
            RESULT: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '结果'
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'io_get_input',
          inputs: {
            MESSAGE: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '请输入内容'
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'io_show_message',
          inputs: {
            MESSAGE: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '你好！'
                }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '🔵 基础逻辑',
      colour: 210,
      contents: [
        {
          kind: 'block',
          type: 'logic_if_simple',
          inputs: {
            CONDITION: {
              shadow: {
                type: 'logic_compare_number'
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'logic_if_else',
          inputs: {
            CONDITION: {
              shadow: {
                type: 'logic_compare_number'
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'loop_repeat'
        },
        {
          kind: 'block',
          type: 'logic_compare_number',
          inputs: {
            A: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            },
            B: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'logic_compare_text',
          inputs: {
            A: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '你好'
                }
              }
            },
            B: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '你好'
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'logic_wait'
        },
        {
          kind: 'block',
          type: 'controls_if'
        },
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 3
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'logic_compare'
        }
      ]
    },
    {
      kind: 'category',
      name: '🔢 数学',
      colour: 230,
      contents: [
        {
          kind: 'block',
          type: 'number_value',
          fields: {
            NUM: 0
          }
        },
        {
          kind: 'block',
          type: 'math_operation',
          inputs: {
            A: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            },
            B: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'math_number',
          fields: {
            NUM: 0
          }
        },
        {
          kind: 'block',
          type: 'math_arithmetic'
        }
      ]
    },
    {
      kind: 'category',
      name: '📝 文本',
      colour: 180,
      contents: [
        {
          kind: 'block',
          type: 'text_value'
        },
        {
          kind: 'block',
          type: 'text_join_simple',
          inputs: {
            TEXT1: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '你好'
                }
              }
            },
            TEXT2: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '世界'
                }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'text'
        },
        {
          kind: 'block',
          type: 'text_join'
        }
      ]
    }
  ]
};

// 图像识别画板的固定工具箱（简化版，仅包含必要积木）
export const imageRecognitionToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🤖 AI 功能',
      colour: 270,
      contents: [
        {
          kind: 'block',
          type: 'ai_image_recognition',
          inputs: {
            IMAGE: {
              shadow: {
                type: 'io_upload_image'
              }
            },
            PROMPT: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '请描述这张图片的内容'
                }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '📺 输入输出',
      colour: 160,
      contents: [
        {
          kind: 'block',
          type: 'io_upload_image'
        },
        {
          kind: 'block',
          type: 'io_display_result'
        },
        {
          kind: 'block',
          type: 'io_show_message',
          inputs: {
            MESSAGE: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '你好！'
                }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '🔵 基础逻辑',
      colour: 210,
      contents: [
        {
          kind: 'block',
          type: 'logic_if_simple',
          inputs: {
            CONDITION: {
              shadow: {
                type: 'logic_compare_number'
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'loop_repeat'
        },
        {
          kind: 'block',
          type: 'logic_compare_number',
          inputs: {
            A: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            },
            B: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '🔢 数学',
      colour: 230,
      contents: [
        {
          kind: 'block',
          type: 'number_value',
          fields: {
            NUM: 0
          }
        },
        {
          kind: 'block',
          type: 'math_operation',
          inputs: {
            A: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            },
            B: {
              shadow: {
                type: 'number_value',
                fields: {
                  NUM: 1
                }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '📝 文本',
      colour: 180,
      contents: [
        {
          kind: 'block',
          type: 'text_value'
        },
        {
          kind: 'block',
          type: 'text_join_simple',
          inputs: {
            TEXT1: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '你好'
                }
              }
            },
            TEXT2: {
              shadow: {
                type: 'text_value',
                fields: {
                  TEXT: '世界'
                }
              }
            }
          }
        }
      ]
    }
  ]
};
