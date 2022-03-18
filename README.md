# AnkiSiyuanconnect

#### 介绍
用于思源笔记和Anki进行同步,目前功能较为初步且不稳定,本人也是在边学JavaScript边编写代码,可能有诸多问题,请谨慎使用

#### 软件架构
使用node.js作为服务器端,用于读写历史同步信息,前端是一个很简陋的网页.另外,目前绝大多数功能放置在前端,由于与Anki通信还存在跨域问题,后期可能会移至后端


#### 安装教程

1.  安装node.js
2.  在Anki中添加AnkiConnect插件,插件码`2055492159`
3.  在AnkiConnect插件的配置中,`webCorsOriginList`下添加`"http://localhost:3300"`,以解决跨域问题

#### 使用说明

1.  运行startServer.cmd
2.  在浏览器中访问http://localhost:3300/index.html 使用(不支持IE浏览器) 
3.  在思源笔记中,对于需要与Anki同步的笔记添加自定义属性`ankilink`,并按如下形式添加属性
   deck_name="牌组名",modelName="Siyuan_Cloze"或"Siyuan_Basic",tags=["标签1","标签2"]

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)

## 鸣谢(不分先后)
感谢gkzhb提供的在Anki中使用markdown的模板https://zhuanlan.zhihu.com/p/137570649
感谢Clouder贡献的Anki对接思源思路和实践,本人从中受到很多启发https://ld246.com/article/1627227554664