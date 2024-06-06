## luci-app-apfree-wifidog

该项目为apfree-wifidog的luci配置界面

### 视频演示

<div align="center">
<a href="https://www.bilibili.com/video/BV18m411d7Yj/?vd_source=b303f6e8e0ed18809d8752d41ab1de7d">
	<img width="800" alt="luci-app-apfree-wifidog_intro_video" src="https://github.com/liudf0716/luci-app-apfree-wifidog/assets/1182593/ce883a3e-bc11-432d-a91c-8f759ffc65b9">
</a>
</div>

### 界面效果

![image](https://github.com/liudf0716/luci-app-apfree-wifidog/assets/1182593/447c1642-9166-4189-af9c-e2c78340c551)

![image](https://github.com/liudf0716/luci-app-apfree-wifidog/assets/1182593/4268dd2b-d53e-4062-bb25-9267b7794ecc)

![image](https://github.com/liudf0716/luci-app-apfree-wifidog/assets/1182593/0b37e335-e620-4faa-b20b-66fc16baff47)

## 如何集成到openwrt中编译

1. 复制仓库中的文件到如下目录，并执行安装

复制项目代码到目录
```
feeds/luci/applications/luci-app-apfree-wifidog/
```

集成项目到luci中
```
./scripts/feeds install luci -a
```

2. 选择路径

`make menuconfig`

LuCI > 3. Applications > luci-app-apfree-wifidog

3. 编译openwrt固件

```
make -j4
```

4. 单独编译

```
make package/luci-app-apfree-wifidog/compile
```

## 联系方式

QQ群：331230369 

## 如何支持我的开源项目？

如果你觉得我的项目对你有帮助，或者你也认同开源精神，欢迎通过以下方式支持我：

1. **Star和Fork项目**：在GitHub上给我的项目加星和Fork。
2. **提出反馈和建议**：通过提交issue或pull request来帮助改进项目。
3. **打赏支持**：通过支付宝或者微信打赏我，帮助我投入更多时间和资源进行开发。

<p align="center">
  <img src="https://github.com/liudf0716/apfree-wifidog/assets/1182593/4f95e99f-c25b-43d6-ba49-f190cb9c9c30" alt="支付宝打赏" width="150" />
</p>
<p align="center">
  <img src="https://github.com/liudf0716/apfree-wifidog/assets/1182593/0754800e-2875-475d-b4c1-dea925df6fff" alt="微信打赏" width="150"/>
</p>
