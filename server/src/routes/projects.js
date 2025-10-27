const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

/**
 * 项目管理路由
 * 处理 Blockly 项目的保存、加载、删除等操作
 */

/**
 * GET /api/projects
 * 获取用户的所有项目
 */
router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { userId: req.user.id };
    if (category) {
      filter.category = category;
    }

    const projects = await Project.find(filter)
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: '获取项目列表失败'
    });
  }
});

/**
 * GET /api/projects/:id
 * 获取单个项目详情
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: '获取项目失败'
    });
  }
});

/**
 * POST /api/projects
 * 创建新项目
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, blocksJson, coverImage } = req.body;

    if (!title || !category || !blocksJson) {
      return res.status(400).json({
        success: false,
        error: '项目标题、分类和积木数据为必填项'
      });
    }

    const project = new Project({
      userId: req.user.id,
      title,
      description,
      category,
      blocksJson,
      coverImage
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: '项目保存成功',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: '保存项目失败'
    });
  }
});

/**
 * PUT /api/projects/:id
 * 更新项目
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, blocksJson, coverImage } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      });
    }

    // 更新字段
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (blocksJson) project.blocksJson = blocksJson;
    if (coverImage !== undefined) project.coverImage = coverImage;

    await project.save();

    res.json({
      success: true,
      message: '项目更新成功',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: '更新项目失败'
    });
  }
});

/**
 * DELETE /api/projects/:id
 * 删除项目
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      });
    }

    res.json({
      success: true,
      message: '项目删除成功'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: '删除项目失败'
    });
  }
});

/**
 * GET /api/projects/templates
 * 获取项目模板（未来功能）
 */
router.get('/templates/list', async (req, res) => {
  try {
    const templates = await Project.find({ isTemplate: true })
      .sort({ createdAt: -1 })
      .select('-userId -__v');

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: '获取模板列表失败'
    });
  }
});

/**
 * POST /api/projects/:id/share
 * 生成项目分享链接
 */
router.post('/:id/share', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      });
    }

    // 生成分享链接
    await project.generateShareToken();

    res.json({
      success: true,
      message: '分享链接生成成功',
      shareToken: project.shareToken,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${project.shareToken}`
    });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({
      success: false,
      error: '生成分享链接失败'
    });
  }
});

/**
 * DELETE /api/projects/:id/share
 * 取消项目分享
 */
router.delete('/:id/share', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      });
    }

    // 取消分享
    await project.revokeShare();

    res.json({
      success: true,
      message: '分享已取消'
    });
  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(500).json({
      success: false,
      error: '取消分享失败'
    });
  }
});

/**
 * GET /api/projects/shared/:shareToken
 * 通过分享链接访问项目（公开访问，不需要认证）
 */
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const project = await Project.findOne({
      shareToken: req.params.shareToken,
      isPublic: true
    }).populate('userId', 'username');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '分享链接无效或已过期'
      });
    }

    // 增加分享访问次数
    project.shareCount += 1;
    await project.save();

    res.json({
      success: true,
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        category: project.category,
        blocksJson: project.blocksJson,
        coverImage: project.coverImage,
        createdAt: project.createdAt,
        author: project.userId?.username || '匿名用户'
      }
    });
  } catch (error) {
    console.error('Get shared project error:', error);
    res.status(500).json({
      success: false,
      error: '获取分享项目失败'
    });
  }
});

module.exports = router;
