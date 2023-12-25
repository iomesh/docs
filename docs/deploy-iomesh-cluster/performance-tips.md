---
id: performance-tips
title: Performance Tips
sidebar_label: Performance Tips
---

# cpu 核心绑定与独占

## 概述

IOMesh 属于性能敏感型应用。在默认情况下，IOMesh Pod 运行时不会绑定在任何 cpu 核心上，这种情况下虽然 IOMesh 可以正常运行，但频繁的 cpu 切换和 cpu cache missing 会导致  IOMesh 性能波动较大，性能上限不理想。

为解决上述问题，IOMesh 提供了 "基于 Kubelet CpuManager" 和 "基于 Kernel parameter" 两种 cpu 核心绑定模式，并且使所绑定的 cpu 能够被 IOMesh 独占。

> _NOTE:_
>   IOMesh 同一时刻仅支持一种 cpu 核心绑定模式，如果需要从其中一种模式切换至另一种，则需要将前一种模式中所做的配置内容完全回滚，再配置另一种模式

## 基于 Kubelet CpuManager 的 cpu 核心绑定配置方式

### 将 Kubelet 的 CpuManager Policy 设置为 static

依次对所有 K8s Worker 节点执行如下操作

1. 参考 [驱逐节点](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node) 文档对节点上的 Pod 进行驱逐
2. 停止 kubelet 服务

```shell
systemctl stop kubelet
```

3. 删除旧的 CPU CpuManager 状态文件。 默认情况下，该文件的路径为 “/var/lib/kubelet/cpu_manager_state”。这会清除 CPUManager 维护的状态，以便新策略设置的 cpusets 不会与其冲突。

4. 修改 Kubelet 配置文件，默认情况下，该文件的路径为 ` /var/lib/kubelet/config.yaml` ，增加如下配置

```yaml
# /var/lib/kubelet/config.yaml
cpuManagerPolicy: "static" # 设置为 static，保证 Guarantee 类型的 Pod 可以独占 cpu
reservedSystemCPUs: "10-13"  # 预留给 K8s 核心服务和系统服务的 cpu 核心，配置方式可参考 https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/
```

5. 启动 kubelet 服务

```
systemctl start kubelet
```

### 配置 IOMesh 自动绑定 Kubelet 分配的 cpu

#### 配置 Helm Values

在 IOMesh Helm Values 文件中，将 `iomesh.cpuExclusiveOptions.cpuExclusivePolicy` 字段设置为 `kubeletCpuManager

```yaml
iomesh:
  cpuExclusiveOptions:
    # Cpu isolation and exclusive policy for IOMesh, support kubeletCpuManager/kernelCpuIsolation/noExclusive. 
    # The default value is kubeletCpuManager
    cpuExclusivePolicy: "kubeletCpuManager"
```

对于新部署的 IOMesh 集群，修改完毕后可以使用 `helm install`进行集群部署。

对于已部署的 IOMesh 集群，修改完毕后可以使用 `helm upgrade`对集群进行配置更新。

## 基于 Kernel parameter 的 cpu 核心绑定配置方式

### 配置内核 cpu 隔离

#### 设置 Linux 内核启动参数

> _NOTE:_
>   此步骤的操作方法可能会有所不同，具体取决于当前使用的 Linux 发行版

在 grub 配置文件中添加`isolcpus`内核启动参数`GRUB_CMDLINE_LINUX_DEFAULT`，其值标识要隔离的 cpu，配置格式可参考 https://man7.org/linux/man-pages/man7/cpuset.7.html#FORMATS。配置文件路径为 /etc/default/grub

默认情况下，IOMesh 需要使用 4 个独占的 cpu 核心（其中 chunk 服务独占 3 cpu，meta 服务独占 1 cpu）。在以下示例中，我们假设系统总共有 16 个 CPU 核心，第 0,1,2,10 号 CPU 核心专用于 IOMesh，在 GRUB_CMDLINE_LINUX_DEFAULT 后追加如下配置

```config
GRUB_CMDLINE_LINUX_DEFAULT="isolcpus=0-2,10"
```

#### 更新 grub 配置

```
grub2-mkconfig -o $(find /boot -name grub.cfg)
```

#### 重启系统

```reboot
reboot
```

#### 验证内核隔离 cpu 是否生效

```shell
# cat /sys/devices/system/cpu/isolated
0-2,10
```



### 配置 IOMesh 绑定内核隔离的 cpu

在 IOMesh Helm values 文件中做如下配置：

1.  将 `iomesh.cpuExclusiveOptions.cpuExclusivePolicy` 字段设置为 `kernelCpuIsolation`
2. 在  `iomesh.cpuExclusiveOptions.exclusiveCpusets` 字段中配置 chunk 和 meta 服务独占的 cpuset

```yaml
iomesh:
  cpuExclusiveOptions:
    # Cpu isolation and exclusive policy for IOMesh, support kubeletCpuManager/kernelCpuIsolation/noExclusive. 
    # The default value is kubeletCpuManager
    cpuExclusivePolicy: "kernelCpuIsolation"
    exclusiveCpusets:
      chunk: 0-2
      meta: 10
```

对于新部署的 IOMesh 集群，修改完毕后可以使用 `helm install`进行集群部署。

对于已部署的 IOMesh 集群，修改完毕后可以使用 `helm upgrade`对集群进行配置更新。

## 验证 IOMesh 核心绑定

在 meta pod 所在的 k8s worker 上执行如下命令验证 meta 服务绑定到了 1 个 cpu 上，命令输出代表 meta 服务成功绑定到了 cpu 3 上。如果绑定未生效，则 cpuset.cpus 的值为空或该文件不存在

```bash
# cat /sys/fs/cgroup/cpuset/zbs/meta-main/cpuset.cpus
3
```

在 chunk pod 所在的 k8s worker 上执行如下命令验证 chunk 服务绑定到了 3 个 cpu 上，以下命令输出代表 chunk 服务成功绑定到了 cpu 0,1,2 上。如果绑定未生效，则 cpuset.cpus 的值为空或该文件不存在

```shell
# cat /sys/fs/cgroup/cpuset/zbs/chunk-io/cpuset.cpus
0
# cat /sys/fs/cgroup/cpuset/zbs/chunk-main/cpuset.cpus
1
# cat /sys/fs/cgroup/cpuset/zbs/others/cpuset.cpus
2
```
