---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

IOMesh can be installed on the Kubernetes platform or the Redhat Openshift Container platform. Before installing and deploying IOMesh, verify the following requirements.

### Cluster Requirements

A Kubernetes cluster or an OpenShift cluster, either of which should have at least 3 worker nodes. The Kubernetes version should be between 1.17 and 1.25, or the OpenShift version between 4.0 and 4.11.

### Hardware Requirements 

Verify that each worker node meets the following configuration requirements.

**CPU**

The CPU architecture should be Intel x86_64, Hygon x86_64, or Kunpeng AArch64, and each worker node should have at least 8 cores.

**Memory**

At least 16 GB on each worker node.

**Storage Controller**

SAS HBA cards or RAID cards that support pass-through mode (JBOD). 

**OS Disk**

One SSD with 100GB free space in /opt directory for storing IOMesh metadata.

**Data & Cache Disk**

Depends on whether the storage architecture is tiered storage or non-tiered storage.

|Architecture|Description|
|---|---|
|Tiered Storage|使用高速介质做缓存，低速介质做容量。“高速”和“低速”是相对概念，例如将速度更快的 NVMe SSD 作为缓存盘，充分发挥硬件性能，而速度稍低的 SATA SSD 或者 HDD 作为数据盘。使用分层模式时，可以选择混闪配置或者全闪配置。|
|Non-Tiered Storage|不设置缓存盘。除了含有系统分区的物理盘，剩余的所有物理盘都作为数据盘使用。存储不分层模式只能使用全闪配置。|

In IOMesh 1.0, tiered storage only supports hybrid mode and non-tiered storage supports all-flash mode.
|Deployment Mode|Disk Requirements for Each Worker Node|
|---|---|
|Hybrid Mode|xxxxxxxx|
|All-Flash Mode|XXXXXX|

**NIC**

At least one 10/25 GbE NIC for each worker node.

### Network Requirements
To avoid contention on network bandwidth, a storage network, either created or an existing one, is required and should be exclusively used by IOMesh. 
- All worker nodes must be connected to the L2 layer network.
- The ping latency of the IOMesh storage network is below 1 ms.

