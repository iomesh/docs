---
id: disaggragated-deployment
title: Disaggregated Deployment
sidebar_label: Disaggregated Deployment
---

### IOMesh as ISCSI Target
IOMesh provides iSCSI access service, which allows you to create an iSCSI LUN by creating a PVC. An iSCSI LUN can use any iSCSI server such as open-iscsi outside the Kubernetes cluster to access iSCSI LUN.


### Storage inside k8s cluster
为 IOMesh 所属 k8s 集群内部 非 IOMesh 节点的 Pod 提供存储

### Storage outside K8S Cluster

为 IOMesh 所属 k8s 集群外部的其它 k8s 集群提供存储

