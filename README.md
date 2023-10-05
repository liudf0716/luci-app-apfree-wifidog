# luci-app-apfree-wifidog
Luci for Apfree-Wifidog

# 使用说明
1. 将 `luci-app-apfree-wifidog` 拷贝到 Luci 的 `applications` 目录
```sh
git clone https://github.com/openwrt/luci.git
git clone https://github.com/liudf0716/luci-app-apfree-wifidog.git
cp -r luci-app-apfree-wifidog luci/applications/
```

2. 下载 OpenWRT
```sh
git clone https://github.com/openwrt/openwrt.git
```

3. 修改 OpenWRT 目录的 `feeds.conf.default` 文件
   注释掉 `src-git-full luci https://git.openwrt.org/project/luci.git`，添加 `src-link luci`，指向 Luci 的绝对路径，如下所示
```sh
#src-git-full luci https://git.openwrt.org/project/luci.git
src-link luci /home/liudf/luci
```

4. 执行 `scripts/feeds update -a` 及 `scripts/feeds install -a` 命令

5. 通过 `make menuconfig` 添加 Apfree-Wifidog

6. 运行 `make -j4` 编译固件

# 配置页面

![image](https://github.com/liudf0716/luci-app-apfree-wifidog/assets/1182593/36d2c5a3-ba53-40d2-b2ee-3ad61314a849)
