---
id: faq
title: FAQ
sidebar_label: FAQ
---

Q: Failed to pull docker image. The error log is: `Too Many Requests - Server message: toomanyrequests: You have reached your pull rate limit.`

A: 


#### 修复建议
在对接 worker 节点上进行 docker login 任意账户或参考 https://www.docker.com/increase-rate-limit 进行 docker 用户升级。另外直接使用离线安装方式可以避免该问题