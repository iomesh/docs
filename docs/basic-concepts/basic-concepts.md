---
id: basic-concepts
title: Basic Concepts
sidebar_label: Basic Concepts
---

Before deploying and using IOMesh, familiarity with the following concepts is suggested.

**Kubernetes**

An open source container orchestration platform for managing containerized workloads and services, facilitating both declarative configuration and automation.

**Node**

Kubernetes runs workloads by placing containers into Pods running on nodes. A node can be a virtual machine or a physical machine. A Kubernetes cluster contains nodes with two different roles: a Control Plane node and a Worker node.

**Control Plane Node**

Control Plane 节点上运行 Kubernetes 集群的控制平面组件（Control Plane Components）和少数用户的工作负载。一般一个 Kubernetes 集群中有 1 个、3 个或 5 个 Control Plane 节点。

**Worker Node**

Worker 节点上运行 Kubernetes 集群的节点组件和容器化的用户工作负载。IOMesh 部署、安装、运行在 Worker 节点上。

**kubectl**

The Kubernetes command-line tool, allowing you to run commands against Kubernetes clusters. 


**Stateful Application**

有状态应用将数据保存到永久性磁盘存储空间，以供服务器、客户端和其他应用使用。供其他应用在其中保存并检索数据的数据库，或键值对存储区就是一种有状态应用的示例。
与有状态应用不同的是，无状态应用在切换会话时，不会将客户端数据保存到服务器。

**CSI**

Container storage interface. A standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems (COs) like Kubernetes.

**IOMesh Block Storage**

IOMesh high-performance block storage service for guaranteeing distributed system consistency and data coherence, managing metadata and local disks, and providing I/O redirection and high availability.

**IOMesh CSI Driver**

The CSI driver that complies with the Kubernetes CSI standard, managing PVs using RPC (Remote Procedure Call) to provide persistent storage for data applications running on Kubernetes. Each Kubernetes persistent volume corresponds to an iSCSI LUN in an IOMesh cluster.

**IOMesh Operator**

The automated O&M component of IOMesh, allowing for rolling upgrades of IOMesh, scaling up or down nodes, GitOps, and also automatic discovery, allocation, and management of block devices.

**Namespace**

A mechanism for isolating groups of resources within a single cluster. Names of resources need to be unique within a namespace, but not across namespaces

**StorageClass**

Provides a way for administrators to describe the "classes" of storage they offer

存储类（StorageClass）为管理员提供了描述存储“类”的方法，包含 provisioner、parameters 和 reclaimPolicy 等字段。这些字段会在 StorageClass 需要动态制备 PersistentVolume 时使用，也可以把存储类理解为 PV 动态制备的模板。这个“类”的概念在其他存储系统中有时被称为 “配置文件”。

**Persistent Volume**

持久卷（PersistentVolume，PV）是集群中的一块存储，与节点相似，都是集群层面的资源。持久卷可以由管理员事先制备，或者使用存储类（StorageClass）来动态制备。持久卷和普通的卷 一样， 也是使用卷插件来实现的，只是它们拥有独立于任何使用持久卷的 Pod 的生命周期。

**Persistent Volume Claim**

持久卷申领（PersistentVolumeClaim，PVC）表达的是用户对存储的请求。概念上与 Pod 类似。Pod 会耗用节点资源，而 PVC 会耗用 PV 资源。Pod 可以请求特定数量的资源（CPU 和内存）；同样 PVC 也可以请求特定的大小和访问模式。

**Volume Snapshot Class**
卷快照类（VolumeSnapshotClass）允许指定属于卷快照（VolumeSnapshot）的不同属性（如 driver、deletionPolicy 和 parameters 等）。在从存储系统的相同卷上获取的快照之间， 这些属性可能有所不同，因此不能通过使用与 PVC 相同的 StorageClass 来表示。

**Volume Snapshot**
卷快照（VolumeSnapshot）是用户对于卷的快照的请求，它类似于持久卷申领。

**Volume Snapshot Content**

卷快照内容（VolumeSnapshotContent）是从一个卷获取的一种快照，该卷由管理员在集群中制备。就像持久卷是集群中的资源一样，它也是集群中的资源。

**Volume Mode**
卷模式（volumeMode）说明了卷的具体模式，有以下两种模式：
文件系统（filesystem）
volumeMode 属性设置为 filesystem 的卷会被 Pod 挂载（Mount）到某个目录。
块（block）
将 volumeMode 属性设置为 block 则可以将卷作为原始块设备来使用。

**Access Mode**

Kubernetes supports three kinds of access modes for PVs: ReadWriteOnce, ReadOnlyMany, and ReadWriteMany.

访问模式（Access Modes）指的是持久卷所支持的具体访问方式。持久卷可以用资源提供者所支持的任何方式挂载到宿主系统上。资源提供者的能力不同，持久卷支持的访问模式也有所不同。访问模式有以下几种：

ReadWriteOnce
卷可以被一个节点以读写方式挂载。 ReadWriteOnce 访问模式也允许运行在同一节点上的多个 Pod 访问卷。

ReadOnlyMany
卷可以被多个节点以只读方式挂载。

ReadWriteMany
卷可以被多个节点以读写方式挂载。

ReadWriteOncePod
卷可以被单个 Pod 以读写方式挂载。 如果您需确保整个集群中只有一个 Pod 可以读取或写入该 PVC， 请使用 ReadWriteOncePod 访问模式。该模式仅支持 CSI 卷以及需要 Kubernetes 1.22 以上版本。
IOMesh 支持 ReadWriteOnce，ReadWriteMany（仅 Block 类型的 PV），ReadOnlyMany（仅 Block 类型的 PV）的访问模式。

**Helm**

Helm is a package manager for Kubernetes that helps find, share, and build Kubernetes with software. Helm Chart can help define, install, and upgrade even the most complex Kubernetes applications. IOMesh supports deployments using Helm Chart.

**Prometheus**

An open-source system monitoring and alerting toolkit. Prometheus 是一个开源的系统监控和警报工具包。Prometheus以时间序列数据的形式收集和存储其指标，也就是说，指标信息与记录的时间戳，同时还有被称为标签的可选键值对会一起被存储。
（Prometheus is an open-source systems monitoring and alerting toolkit. Prometheus collects and stores its metrics as time series data, i.e. metrics information is stored with the timestamp at which it was recorded, alongside optional key-value pairs called labels.）

IOMesh 支持使用 Prometheus 来监控集群内存储相关的指标并提供报警。

**Grafana**
  
Grafana 是一个开源软件，提供了查询、可视化、提醒和探索指标、日志和追踪的能力。Grafana 可以将时间序列数据库（TSDB）数据转换为有洞察力的可视化图形。
IOMesh 提供了标准的 Grafana Dashboard 模板和报警规则 Json 文件，供用户导入自己的 Grafana。




